"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
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
const MIN_TIME_DELTA = 0.025;

/** Paused architectural footage whose position is controlled exclusively by external progress. */
const PhotorealWalkthrough = forwardRef<PhotorealWalkthroughHandle, PhotorealWalkthroughProps>(
  function PhotorealWalkthrough({
    desktopSrc = "/media/recorrido-web.mp4",
    mobileSrc = "/media/recorrido-vertical.mp4",
    poster = "/media/recorrido-poster.jpg",
    mobilePoster = "/media/recorrido-poster-vertical.jpg",
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
      let selectedSrc = "";
      let seekTimer: number | undefined;
      let stallTimer: number | undefined;
      let initialTimer: number | undefined;
      let watchdogTimer: number | undefined;
      let issuedTarget = -1;
      let quietRetries = 0;
      let presentationRequest: number | undefined;
      const active = () => !disposed && inView && visible;
      const diagnosticFrame = (progress: number) => Math.round(normalize(progress) * (count - 1)) + 1;

      function clearTimer(name: "seek" | "stall" | "initial" | "watchdog") {
        if (name === "seek" && seekTimer !== undefined) { window.clearTimeout(seekTimer); seekTimer = undefined; }
        if (name === "stall" && stallTimer !== undefined) { window.clearTimeout(stallTimer); stallTimer = undefined; }
        if (name === "initial" && initialTimer !== undefined) { window.clearTimeout(initialTimer); initialTimer = undefined; }
        if (name === "watchdog" && watchdogTimer !== undefined) { window.clearTimeout(watchdogTimer); watchdogTimer = undefined; }
      }

      function diagnostics() {
        root!.dataset.inView = String(inView);
        root!.dataset.active = String(active());
        root!.dataset.readyDuration = lastTime.toFixed(3);
        root!.dataset.readyState = String(video!.readyState);
        root!.dataset.seekState = unlocking ? "unlocking" : video!.seeking ? "native-seeking" : seeking ? "waiting-seeked" : seekTimer !== undefined ? "scheduled" : "idle";
      }

      function feedback(next: Status, message = "") {
        if (disposed) return;
        status = next;
        root!.dataset.status = next;
        diagnostics();
        video!.setAttribute("aria-busy", String(next === "loading" || next === "buffering"));
        if (messageRef.current) {
          messageRef.current.setAttribute("aria-live", next === "buffering" || next === "ready" ? "off" : "polite");
          if (messageRef.current.textContent !== message) messageRef.current.textContent = message;
        }
        if (buttonRef.current) {
          buttonRef.current.hidden = next !== "error" && next !== "interaction";
          buttonRef.current.disabled = unlocking;
          buttonRef.current.textContent = next === "interaction" ? "Activar recorrido" : "Reintentar recorrido";
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
        hasFrame = true;
        root!.dataset.hasFrame = "true";
        video!.dataset.currentFrame = String(diagnosticFrame(lastTime > 0 ? mediaTime / lastTime : 0));
        video!.dataset.currentTime = mediaTime.toFixed(3);
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
            const remaining = Math.abs(requested * lastTime - video!.currentTime);
            if (active() && remaining >= MIN_TIME_DELTA) {
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
        if (!active() || !lastTime || seeking || video!.seeking || video!.readyState < 1 || status === "error" || status === "interaction" || unlocking) return;
        const target = requested * lastTime;
        // WebKit can round a near-zero seek to zero without emitting seeked. Wait for data instead.
        if (Math.abs(target - video!.currentTime) < MIN_TIME_DELTA) return;
        const wait = MIN_SEEK_INTERVAL - (performance.now() - lastSeekAt);
        if (wait > 0) {
          seekTimer = window.setTimeout(pumpSeek, wait);
          return;
        }
        seeking = true;
        lastSeekAt = performance.now();
        if (Math.abs(target - issuedTarget) >= MIN_TIME_DELTA) quietRetries = 0;
        issuedTarget = target;
        watchPresentation();
        markSlowSeek();
        watchSeek();
        try {
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
        const wait = Math.max(0, MIN_SEEK_INTERVAL - (performance.now() - lastSeekAt));
        seekTimer = window.setTimeout(pumpSeek, wait);
        diagnostics();
      }

      function seek(progress: number) {
        requested = normalize(progress);
        requestedRef.current = requested;
        video!.dataset.targetFrame = String(diagnosticFrame(requested));
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
        const src = mediaQuery.matches ? mobileSrc || desktopSrc : desktopSrc;
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
        video!.dataset.currentFrame = "0";
        video!.dataset.currentTime = "0.000";
        video!.dataset.targetFrame = String(diagnosticFrame(requested));
        feedback("loading", "Preparando recorrido arquitectónico…");
        video!.muted = true;
        video!.defaultMuted = true;
        video!.playsInline = true;
        video!.preload = "auto";
        video!.poster = mediaQuery.matches ? mobilePoster || poster : poster;
        // There is one selected URL, never two simultaneously mounted video sources.
        video!.src = src;
        video!.load();
        watchPresentation();
        watchInitialLoad();
      }

      function onMetadata() {
        if (!Number.isFinite(video!.duration) || video!.duration <= 0) return;
        lastTime = Math.max(0.001, video!.duration - 1 / 25);
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
        if (Math.abs(video!.currentTime - issuedTarget) < MIN_TIME_DELTA) quietRetries = 0;
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
          watchPresentation();
        } catch {
          if (!disposed && attemptGeneration === generation && !hasFrame) feedback("error", "El navegador no pudo activar el recorrido. Puedes volver a intentarlo.");
        } finally {
          if (attemptGeneration === generation) {
            video!.pause();
            unlocking = false;
            if (buttonRef.current) buttonRef.current.disabled = false;
            if (!disposed) { seeking = false; scheduleSeek(); }
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
          <source media="(max-width: 800px)" srcSet={mobilePoster || poster} />
          <img src={poster} alt="" fetchPriority="high" decoding="async" draggable={false} />
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

