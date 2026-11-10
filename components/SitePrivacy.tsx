"use client";

import { useEffect, useId, useRef, useState } from "react";
import { siteUrl } from "@/lib/site-url";

const CONSENT_KEY = "nucasa:consent:v1";
const POLICY_VERSION = "2026-11-07-v1";
const TTL = 180 * 24 * 60 * 60 * 1000;
type ConsentChoice = "accepted" | "rejected" | "custom";

export default function SitePrivacy({ triggerClassName = "" }: { triggerClassName?: string }) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const restoreFrame = useRef<number | undefined>(undefined);
  const [banner, setBanner] = useState(false);
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice | "">("");

  function openPreferences() {
    const active = document.activeElement;
    openerRef.current = active instanceof HTMLElement && active !== document.body ? active : triggerRef.current;
    setOpen(true);
  }

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("privacidad") === "1") openPreferences();
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const record = JSON.parse(stored);
        if (record && record.version === POLICY_VERSION && typeof record.updatedAt === "number"
          && record.updatedAt <= Date.now() && Date.now() - record.updatedAt < TTL
          && ["accepted", "rejected", "custom"].includes(record.status)) {
          setChoice(record.status);
          return;
        }
        localStorage.removeItem(CONSENT_KEY);
      }
    } catch { /* Optional technologies remain disabled. */ }
    setBanner(true);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
    if (!open && dialog?.open) dialog.close();
  }, [open]);

  useEffect(() => () => {
    if (restoreFrame.current !== undefined) window.cancelAnimationFrame(restoreFrame.current);
  }, []);

  function restoreFocus() {
    setOpen(false);
    if (restoreFrame.current !== undefined) window.cancelAnimationFrame(restoreFrame.current);
    restoreFrame.current = window.requestAnimationFrame(() => {
      restoreFrame.current = undefined;
      const target = openerRef.current?.isConnected ? openerRef.current : triggerRef.current;
      const remainingDialog = document.querySelector<HTMLDialogElement>("dialog[open]");
      if (remainingDialog && target && !remainingDialog.contains(target)) return;
      target?.focus({ preventScroll: true });
    });
  }

  function saveConsent(status: ConsentChoice) {
    const record = {
      version: POLICY_VERSION, status, necessary: true,
      analytics: false, advertising: false, externalContent: false, updatedAt: Date.now(),
    };
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(record)); } catch { /* Keep the choice for this session. */ }
    setChoice(status);
    setBanner(false);
    setOpen(false);
  }

  return <>
    <button ref={triggerRef} type="button" className={triggerClassName} onClick={openPreferences}>Configurar privacidad</button>
    {banner && <aside className="cookie-banner" aria-label="Preferencias de privacidad">
      <div><p className="cookie-title">Tu privacidad</p><p>Usamos almacenamiento local para recordar tu elección. No cargamos analítica ni publicidad. <a href={siteUrl("/legal/cookies/")}>Ver política</a></p></div>
      <div className="cookie-actions">
        <button type="button" onClick={() => saveConsent("accepted")}>Aceptar</button>
        <button type="button" onClick={() => saveConsent("rejected")}>Rechazar</button>
        <button type="button" onClick={openPreferences}>Configurar</button>
      </div>
    </aside>}
    <dialog ref={dialogRef} className="privacy-dialog" aria-labelledby={titleId}
      onClose={restoreFocus}
      onCancel={event => { event.preventDefault(); setOpen(false); }}
      onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div className="dialog-top"><span className="eyebrow">TU ELECCIÓN</span><button type="button" autoFocus onClick={() => setOpen(false)} aria-label="Cerrar preferencias de privacidad">×</button></div>
      <h2 id={titleId}>Tu privacidad,<br />en tus manos.</h2>
      <p>Solo utilizamos almacenamiento necesario para recordar esta elección durante 180 días. Aceptar ahora no autoriza nuevos proveedores ni comunicaciones comerciales.</p>
      {[
        { name: "Necesarias", text: "Recuerdan tu elección de privacidad.", checked: true },
        { name: "Analítica", text: "No se utiliza en esta web.", checked: false },
        { name: "Publicidad", text: "No se cargan píxeles publicitarios.", checked: false },
        { name: "Contenido externo", text: "No se incrustan mapas ni videos de terceros.", checked: false },
      ].map(option => <label key={option.name} className="consent-row">
        <span><strong>{option.name}</strong><small>{option.text}</small></span>
        <input type="checkbox" checked={option.checked} disabled readOnly aria-label={option.name + (option.checked ? ", siempre activas" : ", no disponibles")} />
      </label>)}
      <p className="privacy-choice">{choice ? "Puedes actualizar tu elección en cualquier momento." : "Las tecnologías opcionales permanecen desactivadas."} <a href={siteUrl("/legal/privacidad/")}>Política de privacidad</a>.</p>
      <div className="privacy-actions">
        <button type="button" onClick={() => saveConsent("accepted")}>Aceptar</button>
        <button type="button" onClick={() => saveConsent("rejected")}>Rechazar</button>
        <button type="button" onClick={() => saveConsent("custom")}>Guardar preferencias</button>
      </div>
    </dialog>
  </>;
}
