"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { siteUrl } from "@/lib/site-url";
import styles from "./photoreal-walkthrough.module.css";

export type PhotorealWalkthroughHandle = { seek: (progress: number) => void };

export type PhotorealWalkthroughProps = {
  desktopSrc?: string;
  mobileSrc?: string;
  poster?: string;
  mobilePoster?: string;
  /** Normalized diagnostic steps, rather than the encoded video's actual frame rate. */
  frameCount?: number;
  className?: string;
};

type Controls = { seek: (progress: number) => void; retry: () => void };
type Status = "loading" | "ready" | "buffering" | "interaction" | "error";
const normalize = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
const MIN_SEEK_INTERVAL = 1000 / 24;
const VIDEO_FPS = 25;
const FRAME_DURATION = 1 / VIDEO_FPS;

/** Paused architectural footage whose position is controlled exclusively by external progress. */
const PhotorealWalkthrough = forwardRef<PhotorealWalkthroughHandle, PhotorealWalkthroughProps>(
  function PhotorealWalkthrough({
    desktopSrc = "/media/recorrido-web-ligero.mp4",
    mobileSrc = "/media/recorrido-vertical-ligero.mp4",
    poster = "/media/recorrido-poster.webp",
    mobilePoster = "/media/recorrido-poster-vertical.webp",
    frameCount = 307,
    className,
  }, forwardedRef) {
    const rootRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const messageRef = useRef<HTMLParagraphElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const requestedRef = useRef(0);
    const controlsRef = useRef<Controls>({ seek: () => undefined, retry: () => undefined });

    useImperativeHandle(forwardedRef, () => ({
      seek(progress) {
        requestedRef.current = normalize(progress);
        controlsRef.current.seek(requestedRef.current);
      },
    }), []);

    useEffect(() => {
      const root = rootRef.current;
      const video = videoRef.current;
      if (!root || !video) return;
      const mediaQuery = window.matchMedia("(max-width: 800px)");
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const debug = (typeof import.meta.env !== "undefined" && import.meta.env.DEV)
        || new URLSearchParams(window.location.search).get("rendimiento") === "1";
      const count = Math.max(1, Math.floor(Number.isFinite(frameCount) ? frameCount : 307));
      let disposed = false;
      let inView = true;
      let visible = document.visibilityState !== "hidden";
      let requested = requestedRef.current;
      let lastTime = 0;
      let lastSeekAt = -Infinity;
      let seeking = false;
      let hasFrame = false;
      let unlocking = false;
      let unlockUsed = false;
      let generation = 0;
      let status: Status = "loading";
      let feedbackMessage = "";
      let feedbackInitialized = false;
      let selectedSrc = "";
      let seekTimer: number | undefined;
      let stallTimer: number | undefined;
      let initialTimer: number | undefined;
      let watchdogTimer: number | undefined;
      let issuedTarget = -1;
      let quietRetries = 0;
      let presentationRequest: number | undefined;
      let seekCount = 0;
      const active = () => !disposed && inView && visible;
      const diagnosticFrame = (progress: number) => Math.round(normalize(progress) * (count - 1)) + 1;
      const encodedFrame = (time: number) => Math.floor(Math.max(0, time) * VIDEO_FPS + 0.0001);
      const targetFrame = (progress = requested) => Math.min(encodedFrame(lastTime), Math.round(progress * lastTime * VIDEO_FPS));
      const targetTime = () => targetFrame() * FRAME_DURATION;
      const needsSeek = () => targetFrame() !== encodedFrame(video.currentTime);

      function debugValue(element: HTMLElement, name: string, value: string) {
        if (debug && element.dataset[name] !== value) element.dataset[name] = value;
      }

      function clearTimer(name: "seek" | "stall" | "initial" | "watchdog") {
        if (name === "seek" && seekTimer !== undefined) { window.clearTimeout(seekTimer); seekTimer = undefined; }
        if (name === "stall" && stallTimer !== undefined) { window.clearTimeout(stallTimer); stallTimer = undefined; }
        if (name === "initial" && initialTimer !== undefined) { window.clearTimeout(initialTimer); initialTimer = undefined; }
        if (name === "watchdog" && watchdogTimer !== undefined) { window.clearTimeout(watchdogTimer); watchdogTimer = undefined; }
      }

      function diagnostics() {
        if (!debug) return;
        debugValue(root!, "inView", String(inView));
        debugValue(root!, "active", String(active()));
        debugValue(root!, "readyDuration", lastTime.toFixed(3));
        debugValue(root!, "readyState", String(video!.readyState));
        debugValue(root!, "seekState", unlocking ? "unlocking" : video!.seeking ? "native-seeking" : seeking ? "waiting-seeked" : seekTimer !== undefined ? "scheduled" : "idle");
      }

      function feedback(next: Status, message = "") {
        if (disposed) return;
        const changed = !feedbackInitialized || next !== status || message !== feedbackMessage;
        status = next;
        diagnostics();
        if (!changed) return;
        feedbackInitialized = true;
        feedbackMessage = message;
        if (root!.dataset.status !== next) root!.dataset.status = next;
        const busy = String(next === "loading" || next === "buffering");
        if (video!.getAttribute("aria-busy") !== busy) video!.setAttribute("aria-busy", busy);
        if (messageRef.current) {
          const live = next === "buffering" || next === "ready" ? "off" : "polite";
          if (messageRef.current.getAttribute("aria-live") !== live) messageRef.current.setAttribute("aria-live", live);
          if (messageRef.current.textContent !== message) messageRef.current.textContent = message;
        }
        if (buttonRef.current) {
          const hidden = next !== "error" && next !== "interaction";
          const label = next === "interaction" ? "Activar recorrido" : "Reintentar recorrido";
          if (buttonRef.current.hidden !== hidden) buttonRef.current.hidden = hidden;
          if (buttonRef.current.disabled !== unlocking) buttonRef.current.disabled = unlocking;
          if (buttonRef.current.textContent !== label) buttonRef.current.textContent = label;
        }
      }

      function cancelPresentation() {
        if (presentationRequest !== undefined && typeof video!.cancelVideoFrameCallback === "function") {
          video!.cancelVideoFrameCallback(presentationRequest);
        }
        presentationRequest = undefined;
      }

      function confirmFrame(mediaTime: number) {
        if (disposed || video!.readyState < 2) return;
        if (!hasFrame) {
          hasFrame = true;
          root!.dataset.hasFrame = "true";
        }
        if (debug) {
          debugValue(video!, "currentFrame", String(diagnosticFrame(lastTime > 0 ? mediaTime / lastTime : 0)));
          debugValue(video!, "currentTime", mediaTime.toFixed(3));
        }
        clearTimer("initial");
        if (status !== "error") feedback("ready");
      }

      function watchPresentation() {
        if (presentationRequest !== undefined || typeof video!.requestVideoFrameCallback !== "function" || !active()) return;
        presentationRequest = video!.requestVideoFrameCallback((_, metadata) => {
          presentationRequest = undefined;
          confirmFrame(metadata.mediaTime);
        });
      }

      function watchInitialLoad() {
        clearTimer("initial");
        if (!active() || hasFrame) return;
        initialTimer = window.setTimeout(() => {
          initialTimer = undefined;
          if (!hasFrame && active() && status !== "error") {
            feedback("interaction", "El recorrido aún no está listo. Puedes intentar activarlo.");
          }
        }, 6500);
      }

      function markSlowSeek() {
        clearTimer("stall");
        stallTimer = window.setTimeout(() => {
          stallTimer = undefined;
          if (active() && seeking && status !== "error") feedback(hasFrame ? "buffering" : "loading", "Cargando esta vista…");
        }, 650);
      }

      function recoverUnreportedSeek(force = false) {
        if (!seeking || video!.seeking || (!force && performance.now() - lastSeekAt < 100)) return;
        seeking = false;
        clearTimer("stall");
        clearTimer("watchdog");
        if (video!.readyState >= 2) confirmFrame(video!.currentTime);
        diagnostics();
      }

      function watchSeek() {
        clearTimer("watchdog");
        let checks = 0;
        const check = () => {
          watchdogTimer = undefined;
          if (disposed || !seeking) return;
          diagnostics();
          if (!video!.seeking) {
            recoverUnreportedSeek(true);
            if (active() && needsSeek()) {
              if (quietRetries < 2) { quietRetries++; scheduleSeek(); }
              else feedback("interaction", "Activa el recorrido para explorar el espacio.");
            } else quietRetries = 0;
            return;
          }
          // No perpetual RAF or polling: native seeked/data events remain the main driver.
          if (++checks < 8 && active()) watchdogTimer = window.setTimeout(check, 250);
          else if (active() && status !== "error") feedback(hasFrame ? "buffering" : "loading", "Cargando esta vista…");
        };
        watchdogTimer = window.setTimeout(check, 200);
      }

      function pumpSeek() {
        seekTimer = undefined;
        recoverUnreportedSeek();
        diagnostics();
        if (!active() || !lastTime || seeking || video!.seeking || video!.readyState < 1 || status === "error" || unlocking) return;
        // An exhausted attempt waits for fresh input/activation, rather than blocking all future scroll.
        if (status === "interaction" && quietRetries >= 2) return;
        const target = targetTime();
        // WebKit can round a near-zero seek to zero without emitting seeked. Wait for data instead.
        if (!needsSeek()) return;
        const wait = MIN_SEEK_INTERVAL - (performance.now() - lastSeekAt);
        if (wait > 0) {
          seekTimer = window.setTimeout(pumpSeek, wait);
          return;
        }
        seeking = true;
        lastSeekAt = performance.now();
        if (encodedFrame(target) !== encodedFrame(issuedTarget)) quietRetries = 0;
        issuedTarget = target;
        watchPresentation();
        markSlowSeek();
        watchSeek();
        try {
          if (debug) debugValue(root!, "seekCount", String(++seekCount));
          video!.currentTime = target;
          diagnostics();
        } catch {
          seeking = false;
          clearTimer("stall");
          clearTimer("watchdog");
          feedback("interaction", "Activa el recorrido para explorar el espacio.");
        }
      }

      function scheduleSeek() {
        recoverUnreportedSeek();
        if (!active() || seekTimer !== undefined || seeking || video!.seeking || unlocking) return;
        if (!lastTime || video!.readyState < 1 || status === "error" || (status === "interaction" && quietRetries >= 2) || !needsSeek()) return;
        const wait = Math.max(0, MIN_SEEK_INTERVAL - (performance.now() - lastSeekAt));
        seekTimer = window.setTimeout(pumpSeek, wait);
        diagnostics();
      }

      function seek(progress: number) {
        const next = normalize(progress);
        const freshDestination = targetFrame(next) !== targetFrame();
        requested = next;
        requestedRef.current = requested;
        if (debug) debugValue(video!, "targetFrame", String(diagnosticFrame(requested)));
        if (freshDestination && status === "interaction" && video!.readyState >= 2 && !video!.error && !unlocking) {
          // A transient native seek error must not latch a fully buffered video into interaction mode.
          quietRetries = 0;
          if (!video!.seeking) confirmFrame(video!.currentTime);
          else feedback(hasFrame ? "buffering" : "loading", "Cargando esta vista…");
        }
        if (!freshDestination) return;
        diagnostics();
        // While a seek is in flight only this latest destination is retained.
        scheduleSeek();
      }

      function pause() {
        clearTimer("seek");
        clearTimer("stall");
        clearTimer("initial");
        clearTimer("watchdog");
        cancelPresentation();
        video!.pause();
        if (!video!.seeking) seeking = false;
        diagnostics();
      }

      function resume() {
        if (!active()) return;
        recoverUnreportedSeek(true);
        if (!video!.seeking && video!.readyState >= 2) confirmFrame(video!.currentTime);
        else if (seeking) watchSeek();
        watchPresentation();
        watchInitialLoad();
        scheduleSeek();
        diagnostics();
      }

      function loadSource(force = false) {
        const src = siteUrl(mediaQuery.matches ? mobileSrc || desktopSrc : desktopSrc);
        if (!force && src === selectedSrc) return;
        generation++;
        selectedSrc = src;
        pause();
        seeking = false;
        unlocking = false;
        hasFrame = false;
        unlockUsed = false;
        lastTime = 0;
        lastSeekAt = -Infinity;
        issuedTarget = -1;
        quietRetries = 0;
        root!.dataset.hasFrame = "false";
        if (debug) {
          debugValue(video!, "currentFrame", "0");
          debugValue(video!, "currentTime", "0.000");
          debugValue(video!, "targetFrame", String(diagnosticFrame(requested)));
          debugValue(root!, "seekCount", String(seekCount));
        }
        feedback("loading", "Preparando recorrido arquitectónico…");
        video!.muted = true;
        video!.defaultMuted = true;
        video!.playsInline = true;
        video!.preload = "auto";
        video!.poster = siteUrl(mediaQuery.matches ? mobilePoster || poster : poster);
        // There is one selected URL, never two simultaneously mounted video sources.
        video!.src = src;
        video!.load();
        watchPresentation();
        watchInitialLoad();
      }

      function onMetadata() {
        if (!Number.isFinite(video!.duration) || video!.duration <= 0) return;
        lastTime = Math.max(0.001, video!.duration - FRAME_DURATION);
        diagnostics();
        scheduleSeek();
      }

      function onData() {
        if (video!.readyState >= 2 && !video!.seeking) {
          seeking = false;
          clearTimer("stall");
          clearTimer("watchdog");
          // HAVE_CURRENT_DATA confirms the paused initial frame even without RVFC/seeked.
          confirmFrame(video!.currentTime);
        }
        watchPresentation();
        scheduleSeek();
        diagnostics();
      }

      function onSeeked() {
        seeking = false;
        clearTimer("stall");
        clearTimer("watchdog");
        if (encodedFrame(video!.currentTime) === encodedFrame(issuedTarget)) quietRetries = 0;
        if (debug && Number.isFinite(lastSeekAt)) debugValue(root!, "lastSeekMs", (performance.now() - lastSeekAt).toFixed(1));
        // This time is now decoded, unlike the requested currentTime before seek completion.
        confirmFrame(video!.currentTime);
        scheduleSeek();
      }

      function onError() {
        seeking = false;
        clearTimer("seek");
        clearTimer("stall");
        clearTimer("initial");
        clearTimer("watchdog");
        video!.pause();
        feedback("error", "No pudimos cargar el recorrido. Puedes volver a intentarlo.");
      }

      function onPlaying() {
        // The only play call is a user-initiated compatibility unlock, immediately paused below.
        if (!unlocking) video!.pause();
      }

      async function retry() {
        if (unlocking) return;
        if (status !== "interaction" || unlockUsed) { loadSource(true); return; }
        unlockUsed = true;
        unlocking = true;
        const attemptGeneration = generation;
        if (buttonRef.current) buttonRef.current.disabled = true;
        try {
          await video!.play();
          if (disposed || attemptGeneration !== generation) return;
          video!.pause();
          quietRetries = 0;
          if (video!.readyState >= 2 && !video!.seeking) {
            // WebKit may already have current data and never emit another data event or RVFC.
            confirmFrame(video!.currentTime);
          } else if (status === "interaction") {
            feedback("loading", "Preparando recorrido arquitectónico…");
          }
          watchPresentation();
        } catch {
          if (!disposed && attemptGeneration === generation && !hasFrame) feedback("error", "El navegador no pudo activar el recorrido. Puedes volver a intentarlo.");
        } finally {
          if (attemptGeneration === generation) {
            video!.pause();
            unlocking = false;
            if (buttonRef.current) buttonRef.current.disabled = false;
            if (!disposed) {
              seeking = video!.seeking;
              if (seeking) watchSeek();
              scheduleSeek();
            }
          }
        }
      }

      const onVisibility = () => {
        visible = document.visibilityState !== "hidden";
        diagnostics();
        if (active()) resume(); else pause();
      };
      const onMotion = () => {
        // Reduced motion still permits explicit external chapter selection; nothing auto-plays.
        clearTimer("seek");
        scheduleSeek();
      };
      const onSourceChange = () => loadSource();
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        diagnostics();
        if (active()) resume(); else pause();
      }, { rootMargin: "100px 0px", threshold: 0 });

      video.addEventListener("loadedmetadata", onMetadata);
      video.addEventListener("durationchange", onMetadata);
      video.addEventListener("loadeddata", onData);
      video.addEventListener("canplay", onData);
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("error", onError);
      video.addEventListener("playing", onPlaying);
      document.addEventListener("visibilitychange", onVisibility);
      mediaQuery.addEventListener("change", onSourceChange);
      motionQuery.addEventListener("change", onMotion);
      controlsRef.current = { seek, retry: () => { void retry(); } };
      observer.observe(root);
      loadSource();

      return () => {
        disposed = true;
        pause();
        observer.disconnect();
        video.removeEventListener("loadedmetadata", onMetadata);
        video.removeEventListener("durationchange", onMetadata);
        video.removeEventListener("loadeddata", onData);
        video.removeEventListener("canplay", onData);
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
        video.removeEventListener("playing", onPlaying);
        document.removeEventListener("visibilitychange", onVisibility);
        mediaQuery.removeEventListener("change", onSourceChange);
        motionQuery.removeEventListener("change", onMotion);
        video.removeAttribute("src");
        video.load();
        controlsRef.current = { seek: () => undefined, retry: () => undefined };
      };
    }, [desktopSrc, mobileSrc, poster, mobilePoster, frameCount]);

    return (
      <div ref={rootRef} className={styles.walkthrough + (className ? " " + className : "")} data-status="loading" data-has-frame="false">
        <video ref={videoRef} className={styles.video} muted playsInline preload="auto" disablePictureInPicture disableRemotePlayback role="img" aria-label="Recorrido arquitectónico fotorrealista de una residencia" aria-busy="true" />
        <picture className={styles.poster} aria-hidden="true">
          <source media="(max-width: 800px)" srcSet={siteUrl(mobilePoster || poster)} />
          <img src={siteUrl(poster)} alt="" fetchPriority="high" decoding="async" draggable={false} />
        </picture>
        <div className={styles.feedback}>
          <p ref={messageRef} role="status" aria-live="polite">Preparando recorrido arquitectónico…</p>
          <button ref={buttonRef} hidden type="button" onClick={() => controlsRef.current.retry()}>Reintentar recorrido</button>
        </div>
      </div>
    );
  },
);

export default PhotorealWalkthrough;

