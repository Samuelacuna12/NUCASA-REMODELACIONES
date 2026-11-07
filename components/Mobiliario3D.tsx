"use client";

import { Component, useCallback, useEffect, useId, useMemo, useRef, useState, type ComponentRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import styles from "./mobiliario-3d.module.css";

export type Mobiliario3DProps = { modelUrl: string; className?: string };
type LoadState = "idle" | "loading" | "ready" | "error";
type Bridge = { active: boolean; reduced: boolean; dragging: boolean; manualYaw: number; scrollYaw: number; invalidate: () => void; reset: () => void };
type OwnedModel = { object: THREE.Group; sphere: THREE.Sphere; dispose: () => void };
type Orbit = ComponentRef<typeof OrbitControls>;
const INITIAL_DIRECTION = new THREE.Vector3(4.1, 2.5, 5.4).normalize();

function disposeModel(objects: THREE.Object3D[], extraMaterials: Set<THREE.Material>) {
  const geometries = new Set<THREE.BufferGeometry>(), materials = new Set(extraMaterials);
  const textures = new Set<THREE.Texture>(), bitmaps = new Set<ImageBitmap>(), skeletons = new Set<THREE.Skeleton>();
  objects.forEach((object) => object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    geometries.add(mesh.geometry);
    (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach((material) => materials.add(material));
    const skinned = mesh as THREE.SkinnedMesh;
    if (skinned.isSkinnedMesh) skeletons.add(skinned.skeleton);
  }));
  materials.forEach((material) => {
    Object.values(material).forEach((value) => { if (value?.isTexture) textures.add(value); });
    material.dispose();
  });
  textures.forEach((texture) => {
    const source = texture.source?.data;
    (Array.isArray(source) ? source : [source]).forEach((image) => { if (image && typeof image.close === "function") bitmaps.add(image); });
    texture.dispose();
  });
  geometries.forEach((geometry) => geometry.dispose()); skeletons.forEach((skeleton) => skeleton.dispose()); bitmaps.forEach((image) => image.close());
}

function albedoLuminance(material: THREE.MeshStandardMaterial) {
  const factor = material.color;
  const fallback = Math.max(factor.r * 0.2126 + factor.g * 0.7152 + factor.b * 0.0722, 0.005);
  if (!material.map?.image) return fallback;
  try {
    const sample = document.createElement("canvas"); sample.width = sample.height = 32;
    const context = sample.getContext("2d", { willReadFrequently: true });
    if (!context) return fallback;
    context.drawImage(material.map.image as CanvasImageSource, 0, 0, 32, 32);
    const pixels = context.getImageData(0, 0, 32, 32).data;
    const linear = (byte: number) => {
      const value = byte / 255;
      return material.map?.colorSpace === THREE.SRGBColorSpace ? value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4) : value;
    };
    let total = 0, weight = 0;
    for (let offset = 0; offset < pixels.length; offset += 4) {
      const alpha = pixels[offset + 3] / 255;
      total += (linear(pixels[offset]) * factor.r * 0.2126 + linear(pixels[offset + 1]) * factor.g * 0.7152 + linear(pixels[offset + 2]) * factor.b * 0.0722) * alpha;
      weight += alpha;
    }
    return Math.max(weight > 0 ? total / weight : fallback, 0.005);
  } catch { return fallback; }
}

function prepareModel(scenes: THREE.Group[], source: THREE.Group): OwnedModel {
  const originals = new Set<THREE.Material>();
  const object = new THREE.Group();
  let disposed = false;
  const dispose = () => { if (!disposed) { disposed = true; disposeModel(scenes, originals); } };
  try {
    source.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(source), size = bounds.getSize(new THREE.Vector3());
    const largest = Math.max(size.x, size.y, size.z);
    if (bounds.isEmpty() || !Number.isFinite(largest) || largest <= 0) throw new Error("El archivo no contiene un modelo visible.");
    source.position.sub(bounds.getCenter(new THREE.Vector3()));
    const normalized = new THREE.Group(); normalized.add(source); normalized.scale.setScalar(2.7 / largest);
    normalized.updateMatrixWorld(true); normalized.position.y = -new THREE.Box3().setFromObject(normalized).min.y; object.add(normalized); object.updateMatrixWorld(true);
    const candidates: { material: THREE.MeshStandardMaterial; preferred: boolean }[] = [];
    const upholstery = /upholster|fabric|textile|leather|cushion|seat|backrest|sofa|cloth|velvet|suede|tapiz|tela|coj[ií]n|asiento/i;
    const protectedSurface = /wood|walnut|oak|timber|teak|madera|metal|steel|brass|chrome|glass|cristal|marble|m[aá]rmol|floor|piso/i;
    source.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = mesh.receiveShadow = true;
      const copies = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).map((material) => {
        originals.add(material);
        const copy = material.clone(), pbr = copy as THREE.MeshStandardMaterial;
        const label = `${mesh.name} ${material.name}`;
        if (pbr.isMeshStandardMaterial && !pbr.transparent && !protectedSurface.test(label) && (pbr.metalness < 0.45 || pbr.metalnessMap)) candidates.push({ material: pbr, preferred: upholstery.test(label) });
        return copy;
      });
      mesh.material = Array.isArray(mesh.material) ? copies : copies[0];
    });
    const hasUpholstery = candidates.some((entry) => entry.preferred);
    candidates.filter((entry) => !hasUpholstery || entry.preferred).forEach(({ material }) => {
      const color = { value: new THREE.Color("#181716") }, luminance = { value: albedoLuminance(material) };
      const previous = material.onBeforeCompile, cacheKey = material.customProgramCacheKey();
      material.onBeforeCompile = (shader, renderer) => {
        previous.call(material, shader, renderer);
        shader.uniforms.nuCarbon = color; shader.uniforms.nuReferenceLuminance = luminance;
        shader.fragmentShader = `uniform vec3 nuCarbon;\nuniform float nuReferenceLuminance;\n${shader.fragmentShader}`.replace("#include <color_fragment>", `
#include <color_fragment>
float nuSourceLuminance = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
diffuseColor.rgb = nuCarbon * clamp(nuSourceLuminance / nuReferenceLuminance, 0.08, 1.8);
`);
      };
      material.customProgramCacheKey = () => `${cacheKey}|nu-fixed-carbon-r3f-v1`;
    });
    return { object, sphere: new THREE.Box3().setFromObject(object).getBoundingSphere(new THREE.Sphere()), dispose };
  } catch (error) { dispose(); throw error; }
}

function EnvironmentLight() {
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    let disposed = false, target: THREE.WebGLRenderTarget | undefined;
    void import("three/addons/environments/RoomEnvironment.js").then(({ RoomEnvironment }) => {
      if (disposed) return;
      const generator = new THREE.PMREMGenerator(gl), room = new RoomEnvironment();
      try { target = generator.fromScene(room, 0.04); scene.environment = target.texture; scene.environmentIntensity = 0.85; invalidate(); }
      finally { generator.dispose(); room.dispose(); }
    });
    return () => { disposed = true; scene.environment = null; target?.dispose(); };
  }, [gl, scene, invalidate]);
  return <>
    <hemisphereLight args={[0xfff7eb, 0x8b8174, 1.1]} />
    <directionalLight position={[-3.5, 6, 4.5]} color={0xffead4} intensity={3.2} castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4} shadow-camera-near={0.5} shadow-camera-far={20} shadow-normalBias={0.025} shadow-bias={-0.0003} shadow-radius={8} />
    <directionalLight position={[4, 3, -4]} intensity={0.9} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.008, 0]} receiveShadow><planeGeometry args={[12, 12]} /><shadowMaterial color={0x3b3024} opacity={0.12} depthWrite={false} /></mesh>
  </>;
}

function Furniture({ modelUrl, bridge, reduced, onReady, onError }: { modelUrl: string; bridge: Bridge; reduced: boolean; onReady: () => void; onError: (message: string) => void }) {
  const [model, setModel] = useState<OwnedModel | null>(null);
  const { camera, size, invalidate } = useThree();
  const controls = useRef<Orbit>(null), pivot = useRef<THREE.Group>(null), currentYaw = useRef(0), distance = useRef(5);
  const direction = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    let disposed = false, owned: OwnedModel | undefined;
    const abort = new AbortController();
    void (async () => {
      try {
        const response = await fetch(modelUrl, { signal: abort.signal });
        if (!response.ok) throw new Error("No está disponible el archivo del modelo 3D.");
        const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
        const buffer = await response.arrayBuffer();
        if (disposed) return;
        const resourcePath = new URL(".", new URL(modelUrl, window.location.href)).href;
        const gltf = await new GLTFLoader().parseAsync(buffer, resourcePath);
        const scenes = gltf.scenes.length ? gltf.scenes : [gltf.scene];
        if (disposed) { disposeModel(scenes, new Set()); return; }
        owned = prepareModel(scenes, gltf.scene); setModel(owned); invalidate();
      } catch (error) {
        if (!disposed && !abort.signal.aborted) {
          const message = error instanceof Error && ["No está disponible el archivo del modelo 3D.", "El archivo no contiene un modelo visible."].includes(error.message) ? error.message : "No pudimos cargar el modelo 3D. Puedes volver a intentarlo.";
          onError(message);
        }
      }
    })();
    return () => { disposed = true; abort.abort(); owned?.dispose(); };
  }, [modelUrl, invalidate, onError]);

  useEffect(() => {
    if (!model || !controls.current || !(camera as THREE.PerspectiveCamera).isPerspectiveCamera) return;
    const orbit = controls.current, perspective = camera as THREE.PerspectiveCamera;
    const vertical = THREE.MathUtils.degToRad(perspective.fov);
    const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * size.width / size.height);
    distance.current = model.sphere.radius / Math.sin(Math.min(vertical, horizontal) / 2) * 0.86;
    direction.copy(camera.position).sub(orbit.target).normalize();
    if (direction.lengthSq() < 0.5 || orbit.target.lengthSq() === 0) direction.copy(INITIAL_DIRECTION);
    orbit.target.copy(model.sphere.center); camera.position.copy(orbit.target).addScaledVector(direction, distance.current); orbit.update(); orbit.saveState();
    bridge.reset = () => {
      bridge.manualYaw = 0; currentYaw.current = bridge.reduced ? 0 : bridge.scrollYaw;
      const damping = orbit.enableDamping; orbit.enableDamping = false; orbit.reset();
      camera.position.copy(orbit.target).addScaledVector(INITIAL_DIRECTION, distance.current); orbit.update(); orbit.enableDamping = damping; invalidate();
    };
    onReady(); invalidate();
    return () => { bridge.reset = () => {}; };
  }, [model, camera, size.width, size.height, direction, bridge, onReady, invalidate]);

  useFrame((_, delta) => {
    if (!bridge.active || !pivot.current) return;
    const target = bridge.reduced ? 0 : bridge.scrollYaw;
    if (bridge.reduced) currentYaw.current = 0;
    else if (!bridge.dragging) currentYaw.current = THREE.MathUtils.damp(currentYaw.current, target, 10, Math.min(delta, 0.05));
    pivot.current.rotation.y = bridge.manualYaw + currentYaw.current;
    if (!bridge.dragging && Math.abs(currentYaw.current - target) > 0.00015) invalidate();
  });
  return <>
    {model && <group ref={pivot}><primitive object={model.object} /></group>}
    <OrbitControls ref={controls} makeDefault enablePan={false} enableZoom={false} autoRotate={false} enableDamping={!reduced} dampingFactor={0.1} rotateSpeed={0.65} minPolarAngle={Math.PI * 0.18} maxPolarAngle={Math.PI * 0.49}
      onStart={() => { bridge.dragging = true; }} onEnd={() => { bridge.dragging = false; invalidate(); }} />
  </>;
}

function CanvasAccess({ bridge, helpId, ready, onError }: { bridge: Bridge; helpId: string; ready: boolean; onError: (message: string) => void }) {
  const { gl, invalidate } = useThree();
  useEffect(() => {
    bridge.invalidate = invalidate;
    const canvas = gl.domElement; canvas.style.touchAction = "pan-y"; canvas.tabIndex = ready ? 0 : -1;
    canvas.setAttribute("role", "application"); canvas.setAttribute("aria-label", "Modelo de mobiliario 3D. Usa las flechas izquierda y derecha para girarlo; Inicio restablece la vista."); canvas.setAttribute("aria-describedby", helpId);
    const keydown = (event: KeyboardEvent) => {
      if (!ready) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") { event.preventDefault(); bridge.manualYaw += event.key === "ArrowLeft" ? -Math.PI / 12 : Math.PI / 12; invalidate(); }
      else if (event.key === "Home") { event.preventDefault(); bridge.reset(); }
      else if (event.key === "Escape") canvas.blur();
    };
    const lost = (event: Event) => { event.preventDefault(); onError("La vista 3D se interrumpió. Puedes volver a cargarla."); };
    canvas.addEventListener("keydown", keydown); canvas.addEventListener("webglcontextlost", lost); invalidate();
    return () => { canvas.removeEventListener("keydown", keydown); canvas.removeEventListener("webglcontextlost", lost); bridge.invalidate = () => {}; };
  }, [bridge, gl, invalidate, helpId, ready, onError]);
  return null;
}

class ViewerBoundary extends Component<{ children: ReactNode; onError: (message: string) => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError("Tu navegador no pudo iniciar la vista 3D."); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Unavailable({ onError }: { onError: (message: string) => void }) {
  useEffect(() => onError("Tu navegador no pudo iniciar la vista 3D."), [onError]);
  return null;
}

export default function Mobiliario3D({ modelUrl, className }: Mobiliario3DProps) {
  const titleId = useId(), helpId = useId(), stage = useRef<HTMLDivElement>(null);
  const bridge = useRef<Bridge>({ active: false, reduced: false, dragging: false, manualYaw: 0, scrollYaw: 0, invalidate: () => {}, reset: () => {} });
  const [started, setStarted] = useState(false), [active, setActive] = useState(false), [reduced, setReduced] = useState(false);
  const [status, setStatus] = useState<LoadState>("idle"), [error, setError] = useState(""), [attempt, setAttempt] = useState(0);
  const onReady = useCallback(() => setStatus("ready"), []);
  const onError = useCallback((message: string) => { setError(message); setStatus("error"); }, []);
  useEffect(() => {
    if (started) { setStatus("loading"); setError(""); bridge.current.manualYaw = 0; }
  }, [modelUrl, started]);
  useEffect(() => {
    let visible = false;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const scroll = () => {
      if (!bridge.current.active || bridge.current.reduced || !stage.current) return;
      const rect = stage.current.getBoundingClientRect();
      bridge.current.scrollYaw = THREE.MathUtils.degToRad((THREE.MathUtils.clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0, 1) - 0.5) * 20); bridge.current.invalidate();
    };
    const update = () => {
      bridge.current.active = visible && !document.hidden; bridge.current.reduced = preference.matches;
      setActive(bridge.current.active); setReduced(preference.matches);
      if (bridge.current.active) { scroll(); bridge.current.invalidate(); }
    };
    const observer = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) { setStarted(true); setStatus((current) => current === "idle" ? "loading" : current); }
      update();
    }, { threshold: 0.01 }) : undefined;
    if (observer && stage.current) observer.observe(stage.current);
    else { visible = true; setStarted(true); setStatus("loading"); }
    document.addEventListener("visibilitychange", update); preference.addEventListener("change", update); window.addEventListener("scroll", scroll, { passive: true }); update();
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", update); preference.removeEventListener("change", update); window.removeEventListener("scroll", scroll); };
  }, []);
  const retry = () => { setError(""); setStatus("loading"); bridge.current.manualYaw = 0; setAttempt((value) => value + 1); };
  return <section className={[styles.explorer, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
    <div className={styles.heading}><h3 id={titleId}>Explorador 3D</h3><span aria-hidden="true">Interactivo</span></div>
    <div ref={stage} className={styles.stage} aria-busy={status === "loading"}>
      <div className={styles.canvasHost}>{started && status !== "error" && <ViewerBoundary key={`${modelUrl}:${attempt}`} onError={onError}><Canvas
        frameloop={active ? "demand" : "never"} shadows="percentage" dpr={[1, 1.5]} camera={{ position: [4.1, 2.5, 5.4], fov: 36, near: 0.01, far: 100 }}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }} onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); gl.outputColorSpace = THREE.SRGBColorSpace; gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.05; }}
        fallback={<Unavailable onError={onError} />}>
        <EnvironmentLight />
        <Furniture modelUrl={modelUrl} bridge={bridge.current} reduced={reduced} onReady={onReady} onError={onError} />
        <CanvasAccess bridge={bridge.current} helpId={helpId} ready={status === "ready"} onError={onError} />
      </Canvas></ViewerBoundary>}</div>
      {(status === "idle" || status === "loading") && <div className={styles.notice} role="status"><span className={styles.loadingMark} aria-hidden="true" /><p>{status === "loading" ? "Preparando el modelo 3D…" : "El modelo se activa al entrar en pantalla."}</p></div>}
      {status === "error" && <div className={styles.notice} role="alert"><p>{error}</p><button type="button" className={styles.retry} onClick={retry}>Volver a cargar</button></div>}
      <p id={helpId} className={styles.help} hidden={status !== "ready"}>Arrastra para girar <span aria-hidden="true">↔</span><span className={styles.screenReader}>También puedes usar las flechas izquierda y derecha. Pulsa Inicio para restablecer la vista.</span></p>
    </div>
    <div className={styles.toolbar}><span className={styles.caption}>ARRASTRA · GIRA · EXPLORA</span><button type="button" className={styles.reset} disabled={status !== "ready"} onClick={() => bridge.current.reset()}><svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3.5 7A6.5 6.5 0 1 1 3.7 13M3.5 7V2.7M3.5 7H7.8" stroke="currentColor" strokeWidth="1.3" /></svg>Volver a la vista inicial</button></div>
    <p className={styles.caption} aria-live="polite">Pieza de referencia · Visualización 3D.</p>
  </section>;
}
