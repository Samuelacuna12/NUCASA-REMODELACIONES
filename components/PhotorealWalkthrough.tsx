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
      let presentationRequest: number | undefined;
      const active = () => !disposed && inView && visible;
      const diagnosticFrame = (progress: number) => Math.round(normalize(progress) * (count - 1)) + 1;

      function clearTimer(name: "seek" | "stall" | "initial") {
        if (name === "seek" && seekTimer !== undefined) { window.clearTimeout(seekTimer); seekTimer = undefined; }
        if (name === "stall" && stallTimer !== undefined) { window.clearTimeout(stallTimer); stallTimer = undefined; }
        if (name === "initial" && initialTimer !== undefined) { window.clearTimeout(initialTimer); initialTimer = undefined; }
      }

      function feedback(next: Status, message = "") {
        if (disposed) return;
        status = next;
        root!.dataset.status = next;
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

      function pumpSeek() {
        seekTimer = undefined;
        if (!active() || !lastTime || seeking || video!.seeking || video!.readyState < 1 || status === "error" || unlocking) return;
        let target = requested * lastTime;
        // An initial tiny seek also confirms the first frame in browsers without RVFC.
        if (!hasFrame && target < 0.001) target = Math.min(lastTime, 0.001);
        if (hasFrame && Math.abs(target - video!.currentTime) < MIN_TIME_DELTA) return;
        const wait = MIN_SEEK_INTERVAL - (performance.now() - lastSeekAt);
        if (wait > 0) {
          seekTimer = window.setTimeout(pumpSeek, wait);
          return;
        }
        seeking = true;
        lastSeekAt = performance.now();
        watchPresentation();
        markSlowSeek();
        try {
          video!.currentTime = target;
        } catch {
          seeking = false;
          clearTimer("stall");
          feedback("interaction", "Activa el recorrido para explorar el espacio.");
        }
      }

      function scheduleSeek() {
        if (!active() || seekTimer !== undefined || seeking || video!.seeking || unlocking) return;
        const wait = Math.max(0, MIN_SEEK_INTERVAL - (performance.now() - lastSeekAt));
        seekTimer = window.setTimeout(pumpSeek, wait);
      }

      function seek(progress: number) {
        requested = normalize(progress);
        requestedRef.current = requested;
        video!.dataset.targetFrame = String(diagnosticFrame(requested));
        // While a seek is in flight only this latest destination is retained.
        scheduleSeek();
      }

      function pause() {
        clearTimer("seek");
        clearTimer("stall");
        clearTimer("initial");
        cancelPresentation();
        video!.pause();
      }

      function resume() {
        if (!active()) return;
        watchPresentation();
        watchInitialLoad();
        scheduleSeek();
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
        scheduleSeek();
      }

      function onData() {
        watchPresentation();
        scheduleSeek();
      }

      function onSeeked() {
        seeking = false;
        clearTimer("stall");
        // seeked / RVFC are the only events that advance the visible-frame diagnostics.
        confirmFrame(video!.currentTime);
        scheduleSeek();
      }

      function onError() {
        seeking = false;
        clearTimer("seek");
        clearTimer("stall");
        clearTimer("initial");
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

