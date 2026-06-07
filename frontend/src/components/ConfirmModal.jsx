import { useEffect } from "react";

/**
 * ConfirmModal — replaces native browser confirm() and alert() dialogs.
 *
 * Props:
 *   open       {boolean}   — show/hide
 *   type       {string}    — "confirm" | "alert" | "danger"
 *   title      {string}    — heading text
 *   message    {string}    — body text
 *   confirmLabel {string}  — confirm button label (default "Confirm")
 *   cancelLabel  {string}  — cancel button label  (default "Cancel")
 *   onConfirm  {function}  — called when user clicks confirm
 *   onCancel   {function}  — called when user clicks cancel / closes
 */
export default function ConfirmModal({
  open,
  type = "confirm",
  title = "Are you sure?",
  message = "",
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  const isAlert  = type === "alert";
  const isDanger = type === "danger";

  const defaultConfirmLabel = isDanger ? "Delete" : isAlert ? "OK" : "Confirm";
  const btnLabel = confirmLabel || defaultConfirmLabel;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className={`modal-box ${isDanger ? "modal-danger" : isAlert ? "modal-alert" : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Icon */}
        <div className={`modal-icon-wrap ${isDanger ? "modal-icon-danger" : isAlert ? "modal-icon-info" : "modal-icon-warn"}`}>
          {isDanger && <i className="fa-solid fa-trash-can"></i>}
          {isAlert  && <i className="fa-solid fa-circle-info"></i>}
          {!isDanger && !isAlert && <i className="fa-solid fa-triangle-exclamation"></i>}
        </div>

        <h3 className="modal-title">{title}</h3>
        {message && <p className="modal-msg">{message}</p>}

        <div className={`modal-actions ${isAlert ? "modal-actions-center" : ""}`}>
          {!isAlert && (
            <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button
            className={`modal-btn ${isDanger ? "modal-btn-danger" : "modal-btn-confirm"}`}
            onClick={onConfirm}
            autoFocus
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
