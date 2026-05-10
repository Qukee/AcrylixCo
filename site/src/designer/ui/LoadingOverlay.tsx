'use client';

import './LoadingOverlay.css';

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay__inner">
        <div className="loading-overlay__pulse">
          <span />
          <span />
          <span />
        </div>
        <p className="loading-overlay__label">Cutting geometry…</p>
      </div>
    </div>
  );
}
