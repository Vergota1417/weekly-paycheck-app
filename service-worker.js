:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --navy: #16324f;
  --navy-2: #244d72;
  --ink: #17212b;
  --muted: #667482;
  --line: #dbe2e8;
  --surface: #ffffff;
  --background: #edf2f6;
  --success: #17663a;
  --danger: #a22525;
  --shadow: 0 14px 35px rgba(22, 50, 79, 0.10);
}

* { box-sizing: border-box; }

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(36, 77, 114, 0.16), transparent 36%),
    var(--background);
  color: var(--ink);
}

button, input { font: inherit; }

button { -webkit-tap-highlight-color: transparent; }

.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: max(24px, env(safe-area-inset-top)) 20px 24px;
  color: white;
  background: linear-gradient(135deg, var(--navy), var(--navy-2));
}

h1, h2, p { margin-top: 0; }

h1 {
  margin-bottom: 5px;
  font-size: clamp(1.8rem, 8vw, 2.6rem);
  letter-spacing: -0.04em;
}

h2 {
  margin-bottom: 0;
  font-size: 1.18rem;
}

.eyebrow {
  margin-bottom: 6px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  opacity: 0.75;
}

.subtitle {
  margin-bottom: 0;
  opacity: 0.82;
}

main {
  width: min(100%, 660px);
  margin: 0 auto;
  padding: 18px 14px calc(34px + env(safe-area-inset-bottom));
}

.card {
  margin-bottom: 14px;
  padding: 18px;
  border: 1px solid rgba(219, 226, 232, 0.9);
  border-radius: 20px;
  background: var(--surface);
  box-shadow: var(--shadow);
}

label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.91rem;
  font-weight: 750;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 12px;
  padding: 0 14px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: #f9fbfc;
}

.input-wrap:focus-within {
  border-color: var(--navy-2);
  box-shadow: 0 0 0 3px rgba(36, 77, 114, 0.12);
}

input {
  width: 100%;
  min-width: 0;
  padding: 15px 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ink);
  font-size: 1.08rem;
}

.prefix { font-weight: 700; }

.preset-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 7px;
  margin: -2px 0 18px;
}

.preset {
  padding: 9px 4px;
  border: 1px solid var(--line);
  border-radius: 11px;
  background: white;
  color: var(--navy);
  font-weight: 800;
}

.preset:active { transform: translateY(1px); }

.helper {
  margin: -3px 0 15px;
  color: var(--muted);
  font-size: 0.82rem;
  line-height: 1.42;
}

.primary, .secondary {
  width: 100%;
  min-height: 48px;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
}

.primary {
  border: 0;
  background: var(--navy);
  color: white;
}

.secondary {
  border: 1px solid var(--navy);
  background: white;
  color: var(--navy);
}

.primary:active, .secondary:active { transform: translateY(1px); }

.secondary:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.install-button {
  width: auto;
  min-height: 40px;
  padding: 8px 13px;
  border-color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.12);
  color: white;
}

.result-card {
  overflow: hidden;
  border: 0;
  background: linear-gradient(145deg, #ffffff, #f7fafc);
}

.result-label {
  margin-bottom: 4px;
  color: var(--muted);
  font-size: 0.9rem;
  font-weight: 700;
}

.net-pay {
  margin-bottom: 6px;
  color: var(--success);
  font-size: clamp(2.6rem, 13vw, 4.5rem);
  font-weight: 900;
  letter-spacing: -0.055em;
  line-height: 1;
}

.confidence {
  margin-bottom: 18px;
  color: var(--muted);
  font-size: 0.82rem;
}

.breakdown {
  margin-bottom: 15px;
  border-top: 1px solid var(--line);
}

.breakdown > div {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
}

.breakdown span { color: var(--muted); }

.breakdown strong { white-space: nowrap; }

.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.section-heading .eyebrow { margin-bottom: 3px; }

.text-button {
  padding: 6px 3px;
  border: 0;
  background: transparent;
  color: var(--navy-2);
  font-weight: 800;
  cursor: pointer;
}

.history-list { display: grid; }

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 0;
  border-top: 1px solid var(--line);
}

.history-item:first-child { border-top: 0; }

.history-item > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.history-net { font-size: 1.12rem; }

.history-meta {
  color: var(--muted);
  font-size: 0.79rem;
}

.empty-state {
  margin: 8px 0 2px;
  color: var(--muted);
  text-align: center;
}

.settings-card summary {
  cursor: pointer;
  color: var(--navy);
  font-weight: 850;
}

.settings-note { margin-top: 13px; }

.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 11px;
}

.settings-grid label {
  margin: 0;
  color: var(--muted);
  font-size: 0.78rem;
}

.settings-grid input {
  margin-top: 5px;
  padding: 11px;
  border: 1px solid var(--line);
  border-radius: 11px;
  color: var(--ink);
  font-size: 0.98rem;
}

.settings-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 7px;
  margin-top: 15px;
}

.legal {
  padding: 0 8px;
  color: var(--muted);
  font-size: 0.74rem;
  line-height: 1.45;
  text-align: center;
}

@media (max-width: 390px) {
  .settings-grid { grid-template-columns: 1fr; }
  .card { padding: 16px; }
  .preset-row { gap: 5px; }
}

@media (display-mode: standalone) {
  .install-button { display: none !important; }
}
