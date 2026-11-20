# Weekly Paycheck App

A phone-first weekly take-home paycheck estimator that can run offline via GitHub Pages.

## Main calculator

- Enter weekly hours and any one-time taxable pay.
- Use quick presets for 40, 45, 50, 55, or 60 hours.
- Existing take-home calculations use historical payroll checkpoints under default settings.
- Pay rate, overtime rules, deductions, and saved weekly history remain editable on your device.

## Best hours for my money — new 2026 analyzer

The overtime analyzer compares 40, 45, 50, 55, 60, 65, and 70 hours and displays:

- Estimated take-home per week (annual tax-liability method).
- Extra net pay earned in each new five-hour block.
- Extra net pay per overtime hour and the proportion of gross overtime kept.
- The first five-hour block where marginal value falls by your chosen percentage.
- A warning if the incremental net hourly pay is below your personal minimum.

**Important:** This is a separate annual-tax estimator. It does not replace the original weekly payroll-checkpoint model, saved history, or paycheck withholding.

### Customize the projection

Expand **Personalize overtime estimate**. Set filing status, 2026 weeks at those hours, year-to-date wages and pre-tax deductions, other taxable household income, Illinois personal exemptions, and your worthwhile hourly threshold. Use 52 weeks for a year-round scenario, or the actual remaining weeks plus year-to-date values for a partial-year scenario. The app reuses the regular hourly rate and deductions from **Calculation settings**.

The federal deduction for **qualified overtime compensation** is **off by default**. Only enable it when you have verified eligibility. For eligible FLSA overtime at time-and-a-half, the model uses the **extra half-rate premium**, not the entire overtime wage, with the 2026 $12,500 individual / $25,000 joint federal deduction limit and income phaseout. It does not treat the deduction as an Illinois or payroll-tax exemption.

### Model limitations

- Estimates the **2026 annual income-tax liability** using IRS federal brackets, standard deduction, Illinois 4.95% tax, and 2026 Social Security/Medicare limits. It is **not** a tax return, withholding calculator, or professional tax advice.
- Model assumes one employer for Social Security limits and assumes all other taxable income is ordinary taxable income. Other household income affects modeled income-tax brackets but not the worker's FICA.
- Pre-tax deductions reduce income taxes, but FICA is applied to gross wages; some real benefit deductions reduce FICA. Excludes child/education credits, itemized deductions, investment capital-gain treatment, AMT, multi-state taxes, and other individual tax circumstances.
- Models qualified overtime premium and deduction limits approximately, including a proportional phaseout. Eligibility requires checking employer statements and IRS rules.
- Figures may differ from actual paychecks due to payroll withholding and employer benefit setup. Extra hours normally add to net earnings even as the incremental amount retained falls.
- Tax year is intentionally pinned to **2026**; update the rules before using it for a future tax year.

**Official sources:** [IRS 2026 brackets and deduction](https://www.irs.gov/irb/2025-45_IRB), [IRS qualified overtime](https://www.irs.gov/newsroom/one-big-beautiful-bill-how-to-take-advantage-of-no-tax-on-tips-and-overtime), [Illinois withholding](https://tax.illinois.gov/forms/withholding/currentyear/il-700-t-withholding-guide-tables.html), [SSA 2026 wage base](https://www.ssa.gov/cola/factsheets/2026.html).

## Deploy

In GitHub: **Settings → Pages → Deploy from branch → main → /(root)**. GitHub Pages hosting must be enabled. The repository must be public on GitHub Free.

The required app files are in the repository root: `index.html`, `overtime.js`, `manifest.webmanifest`, `service-worker.js`, `icon-192.png`, and `icon-512.png`.

The service worker includes the analyzer in its offline cache and does not cache 404 responses.

## Validate

From a checkout with Node.js 22:

```bash
node --test tests/overtime.test.cjs
```

GitHub Actions runs this test on pushes and pull requests.

## Privacy

Preferences and weekly history are stored locally in your browser. This app does not upload your earnings or pay history.
