<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="theme-color" content="#16324f">
  <meta name="description" content="Offline weekly paycheck and take-home pay estimator.">
  <title>Weekly Paycheck</title>
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" href="icons/icon-192.png">
  <link rel="apple-touch-icon" href="icons/icon-192.png">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="app-header">
    <div>
      <p class="eyebrow">WEEKLY PAY ESTIMATOR</p>
      <h1>Paycheck Check</h1>
      <p class="subtitle">Hours in. Estimated take-home out.</p>
    </div>
    <button id="installButton" class="secondary install-button" hidden>Install</button>
  </header>

  <main>
    <section class="card input-card">
      <label for="hours">Hours worked</label>
      <div class="input-wrap">
        <input id="hours" type="number" inputmode="decimal" min="0" step="0.01"
               placeholder="Example: 45.50" autocomplete="off">
        <span>hrs</span>
      </div>

      <div class="preset-row" aria-label="Quick hour presets">
        <button class="preset" data-hours="40">40</button>
        <button class="preset" data-hours="45">45</button>
        <button class="preset" data-hours="50">50</button>
        <button class="preset" data-hours="55">55</button>
        <button class="preset" data-hours="60">60</button>
      </div>

      <label for="extraPay">Additional taxable pay</label>
      <div class="input-wrap">
        <span class="prefix">$</span>
        <input id="extraPay" class="money-input" type="number" inputmode="decimal"
               min="0" step="0.01" value="0.00" autocomplete="off">
      </div>
      <p class="helper">Leave at $0.00 unless the check includes bonus, holiday, PTO, premium, or correction pay.</p>

      <button id="calculateButton" class="primary">Calculate take-home</button>
    </section>

    <section id="resultCard" class="card result-card" aria-live="polite">
      <p class="result-label">Estimated net pay</p>
      <div id="netPay" class="net-pay">$0.00</div>
      <p id="confidence" class="confidence">Enter this week’s hours to calculate.</p>

      <div class="breakdown">
        <div><span>Regular hours</span><strong id="regularHours">0.00</strong></div>
        <div><span>Overtime hours</span><strong id="overtimeHours">0.00</strong></div>
        <div><span>Gross pay</span><strong id="grossPay">$0.00</strong></div>
        <div><span>Pre-tax deductions</span><strong id="preTax">−$0.00</strong></div>
        <div><span>Employee taxes</span><strong id="taxes">−$0.00</strong></div>
        <div><span>Post-tax deductions</span><strong id="postTax">−$0.00</strong></div>
      </div>

      <button id="saveButton" class="secondary" disabled>Save this week</button>
    </section>

    <section class="card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">SAVED ON THIS PHONE</p>
          <h2>Weekly history</h2>
        </div>
        <button id="clearHistoryButton" class="text-button">Clear</button>
      </div>
      <div id="historyList" class="history-list">
        <p class="empty-state">No saved weeks yet.</p>
      </div>
    </section>

    <details class="card settings-card">
      <summary>Calculation settings</summary>
      <p class="helper settings-note">These defaults were fitted to your supplied payroll checks. Change them only when your pay or deductions change.</p>

      <div class="settings-grid">
        <label>Regular rate
          <input id="regularRate" type="number" inputmode="decimal" min="0" step="0.01">
        </label>
        <label>Overtime starts after
          <input id="overtimeStart" type="number" inputmode="decimal" min="0" step="0.01">
        </label>
        <label>Overtime multiplier
          <input id="overtimeMultiplier" type="number" inputmode="decimal" min="0" step="0.01">
        </label>
        <label>Fixed pre-tax deduction
          <input id="fixedPreTax" type="number" inputmode="decimal" min="0" step="0.01">
        </label>
        <label>Variable pre-tax %
          <input id="variablePreTax" type="number" inputmode="decimal" min="0" step="0.01">
        </label>
        <label>Post-tax deduction
          <input id="postTaxSetting" type="number" inputmode="decimal" min="0" step="0.01">
        </label>
      </div>

      <div class="settings-actions">
        <button id="saveSettingsButton" class="secondary">Save settings</button>
        <button id="resetSettingsButton" class="text-button">Restore defaults</button>
      </div>
    </details>

    <p class="legal">
      Estimate only. Actual payroll can change because of W-4 elections, benefit changes,
      payroll rounding, bonuses, tax limits, and employer-specific rules.
    </p>
  </main>

  <template id="historyTemplate">
    <article class="history-item">
      <div>
        <strong class="history-net"></strong>
        <span class="history-meta"></span>
      </div>
      <button class="delete-history text-button" aria-label="Delete saved week">Delete</button>
    </article>
  </template>

  <script src="app.js"></script>
</body>
</html>
