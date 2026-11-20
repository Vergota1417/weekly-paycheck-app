(function overtimeFeature() {
  "use strict";
  const TAX = {
    year: 2026,
    standard: {single:16100, joint:32200, head:24150, separate:16100},
    brackets: {
      single: [[12400,.10],[50400,.12],[105700,.22],[201775,.24],[256225,.32],[640600,.35],[Infinity,.37]],
      joint: [[24800,.10],[100800,.12],[211400,.22],[403550,.24],[512450,.32],[768700,.35],[Infinity,.37]],
      head: [[17700,.10],[67450,.12],[105700,.22],[201750,.24],[256200,.32],[640600,.35],[Infinity,.37]],
      separate: [[12400,.10],[50400,.12],[105700,.22],[201775,.24],[256225,.32],[384350,.35],[Infinity,.37]]
    },
    illinoisRate: .0495,
    illinoisExemption: 2925,
    socialSecurityCap: 184500
  };
  const DEFAULT_OPTIONS = Object.freeze({
    filing:"single", weeks:52, earnedYTD:0, pretaxYTD:0,
    premiumYTD:0, otherIncome:0, stateExemptions:1,
    qualifiedOT:false, dropPercent:10, minimumNetHourly:30
  });
  const STORAGE_KEY = "paycheck-overtime-settings-2026-v1";
  const round = x => Math.round((x + Number.EPSILON) * 100) / 100;
  const cash = x => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(x);
  const clamp = (value,min,max,defaultValue) => {
    const v=Number(value);
    return Number.isFinite(v) && v>=min ? Math.min(v,max) : defaultValue;
  };
  function federalProgressive(taxable, brackets) {
    let tax=0,lower=0,remaining=Math.max(0,taxable);
    for (const [upper,rate] of brackets) {
      const portion=Math.max(0,Math.min(remaining,upper-lower));
      tax+=portion*rate;
      remaining-=portion;
      lower=upper;
      if(remaining<=0)break;
    }
    return tax;
  }
  function sanitizeOptions(o) {
    const input=o||{};
    const filing = Object.hasOwn(TAX.standard,input.filing) ? input.filing : "single";
    return {
      filing,
      weeks:clamp(input.weeks,1,52,52),
      earnedYTD:clamp(input.earnedYTD,0,10000000,0),
      pretaxYTD:clamp(input.pretaxYTD,0,10000000,0),
      premiumYTD:clamp(input.premiumYTD,0,10000000,0),
      otherIncome:clamp(input.otherIncome,0,10000000,0),
      stateExemptions:clamp(input.stateExemptions,0,20,1),
      qualifiedOT:input.qualifiedOT===true,
      dropPercent:clamp(input.dropPercent,1,90,10),
      minimumNetHourly:clamp(input.minimumNetHourly,0,500,30)
    };
  }
  function annualTaxes({ownGross,preTax,otherIncome,premium,options}) {
    const filing=options.filing;
    const agi=Math.max(0,ownGross+otherIncome-preTax);
    // This is the potentially qualified *premium*, not the full overtime pay.
    const maxDeduction=filing==="joint"?25000:12500;
    const phaseoutStarts=filing==="joint"?300000:150000;
    const phasedReduction=Math.max(0,agi-phaseoutStarts)*.10;
    const overtimeDeduction=(options.qualifiedOT && filing!=="separate")
      ? Math.max(0,Math.min(maxDeduction,premium)-phasedReduction)
      : 0;
    const federalTax=federalProgressive(
      Math.max(0,agi-TAX.standard[filing]-overtimeDeduction),
      TAX.brackets[filing]
    );
    // Federal Schedule 1-A overtime deduction does not reduce Illinois AGI here.
    const exemptionAllowed=agi<=(filing==="joint"?500000:250000);
    const ilTax=Math.max(0,agi-(exemptionAllowed?options.stateExemptions*TAX.illinoisExemption:0))*TAX.illinoisRate;
    // Other household income is included for income-tax brackets, not the
    // employee's own FICA; some pre-tax benefit deductions also reduce FICA,
    // which this deliberately simplified estimator does not model.
    const fica=Math.min(ownGross,TAX.socialSecurityCap)*.062 + ownGross*.0145;
    const medicareThreshold=filing==="joint"?250000:filing==="separate"?125000:200000;
    const additionalMedicare=Math.max(0,ownGross-medicareThreshold)*.009;
    return {
      federal:federalTax,state:ilTax,fica:fica+additionalMedicare,
      overtimeDeduction, total:federalTax+ilTax+fica+additionalMedicare
    };
  }
  function scenario(hours,options,paySettings) {
    const o=sanitizeOptions(options);
    const s=paySettings||{};
    const rate=clamp(s.rate,0,10000,36.10);
    const otStart=clamp(s.otStart,0,168,40);
    const multiplier=clamp(s.otMultiplier,1,10,1.5);
    const fixedPreTax=clamp(s.fixedPreTax,0,100000,176.80);
    const variablePreTax=clamp(s.variablePreTax,0,100,4);
    const postTax=clamp(s.postTax,0,100000,1.13);
    const regularHours=Math.min(hours,otStart);
    const paidOT=Math.max(0,hours-otStart);
    const weeklyGross=regularHours*rate+paidOT*rate*multiplier;
    const weeklyPreTax=Math.min(weeklyGross,fixedPreTax+weeklyGross*variablePreTax/100);
    const weeklyPostTax=postTax;
    const futureGross=weeklyGross*o.weeks;
    const futurePreTax=weeklyPreTax*o.weeks;
    const futurePostTax=weeklyPostTax*o.weeks;
    const flsaHours=Math.max(0,hours-Math.max(40,otStart));
    const qualifiedPremium=(o.qualifiedOT && multiplier>=1.5)
      ? (flsaHours*rate*.5*o.weeks)
      : 0;
    const baseTaxes=annualTaxes({
      ownGross:o.earnedYTD,preTax:o.pretaxYTD,
      otherIncome:o.otherIncome,premium:o.premiumYTD,options:o
    });
    const projectedTaxes=annualTaxes({
      ownGross:o.earnedYTD+futureGross,preTax:o.pretaxYTD+futurePreTax,
      otherIncome:o.otherIncome,premium:o.premiumYTD+qualifiedPremium,options:o
    });
    const incrementalTaxes=projectedTaxes.total-baseTaxes.total;
    const futureNet=futureGross-futurePreTax-futurePostTax-incrementalTaxes;
    return {
      hours,weeklyGross:round(weeklyGross),
      weeklyNet:round(futureNet/o.weeks),
      weeklyPreTax:round(weeklyPreTax),
      weeklyPostTax:round(weeklyPostTax),
      futureNet, taxes:projectedTaxes,
      weeklyTaxes:round(incrementalTaxes/o.weeks),
      qualifiedPremium:round(qualifiedPremium),
      overtimeDeduction:round(projectedTaxes.overtimeDeduction)
    };
  }
  function analyzeHours(options,paySettings) {
    const opts=sanitizeOptions(options);
    const rows=[];
    let prev=null,firstPerHour=null;
    for(let hours=40;hours<=70;hours+=5){
      const result=scenario(hours,opts,paySettings);
      const increase=prev?round(result.weeklyNet-prev.weeklyNet):null;
      const grossIncrease=prev?round(result.weeklyGross-prev.weeklyGross):null;
      const perHour=increase===null?null:round(increase/5);
      if(firstPerHour===null && perHour!==null)firstPerHour=perHour;
      rows.push({
        ...result, extraNet:increase, extraGross:grossIncrease, perHour,
        retainedPercent:grossIncrease>0?round(100*increase/grossIncrease):null,
        dropPercent:(perHour!==null && firstPerHour>0)
          ?round(100*(firstPerHour-perHour)/firstPerHour):null
      });
      prev=result;
    }
    const blocks=rows.filter(r=>r.perHour!==null);
    const best=blocks.reduce((top,r)=>!top||r.perHour>top.perHour?r:top,null);
    const firstDrop=blocks.find(r=>r.dropPercent!==null&&r.dropPercent>=opts.dropPercent)||null;
    const firstBelow=blocks.find(r=>r.perHour<opts.minimumNetHourly)||null;
    return {options:opts,rows,best,firstDrop,firstBelow};
  }
  const api={TAX,DEFAULT_OPTIONS,sanitizeOptions,federalProgressive,annualTaxes,scenario,analyzeHours};
  if(typeof document==="undefined")return api;
  const id=name=>document.getElementById(name);
  const section=id("otAnalyzer");
  if(!section)return api;
  let preferences={...DEFAULT_OPTIONS};
  try {
    preferences={...preferences,...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};
  } catch (_) {
    preferences={...DEFAULT_OPTIONS};
  }
  preferences=sanitizeOptions(preferences);
  const inputs={
    filing:"otFiling",weeks:"otWeeks",earnedYTD:"otEarnedYTD",
    pretaxYTD:"otPretaxYTD",premiumYTD:"otPremiumYTD",otherIncome:"otOtherIncome",
    stateExemptions:"otExemptions",qualifiedOT:"otEligible",
    dropPercent:"otDropPercent",minimumNetHourly:"otMinHourly"
  };
  for(const [key,name] of Object.entries(inputs)){
    const el=id(name);
    if(el.type==="checkbox")el.checked=preferences[key];
    else el.value=preferences[key];
    el.addEventListener("change",()=>{
      const updated={...preferences};
      updated[key]=el.type==="checkbox"?el.checked:el.value;
      preferences=sanitizeOptions(updated);
      for(const [field,fieldId] of Object.entries(inputs)){
        const control=id(fieldId);
        if(control.type==="checkbox")control.checked=preferences[field];
        else control.value=preferences[field];
      }
      try {localStorage.setItem(STORAGE_KEY,JSON.stringify(preferences));}catch(_){}
      renderAnalyzer();
    });
  }
  function makeCell(tr,text,tag) {
    const el=document.createElement(tag||"td");
    el.textContent=text;
    tr.append(el);
    return el;
  }
  function renderAnalyzer() {
    // The analyzer does not change the existing payroll-checkpoint calculator.
    let s={rate:36.10,otStart:40,otMultiplier:1.5,fixedPreTax:176.80,
      variablePreTax:4,postTax:1.13};
    try {
      if(typeof loadSettings==="function")s=loadSettings();
    } catch (_){}
    const a=analyzeHours(preferences,s);
    const body=id("otRows");
    body.replaceChildren();
    const entered=Number.parseFloat(id("hours").value);
    const selected=Number.isFinite(entered)&&entered>40
      ?Math.max(45,Math.min(70,Math.ceil(entered/5)*5)):40;
    for(const r of a.rows){
      const tr=document.createElement("tr");
      if(r.hours===selected)tr.className="ot-selected";
      makeCell(tr,String(r.hours)+" hrs","th");
      makeCell(tr,cash(r.weeklyNet));
      makeCell(tr,r.extraNet===null?"—":(r.extraNet>=0?"+":"")+cash(r.extraNet));
      makeCell(tr,r.perHour===null?"—":cash(r.perHour));
      makeCell(tr,r.retainedPercent===null?"—":r.retainedPercent.toFixed(1)+"%");
      body.append(tr);
    }
    id("otBest").textContent=a.best?String(a.best.hours-5)+"–"+a.best.hours+" hrs":"—";
    id("otBestRate").textContent=a.best?cash(a.best.perHour)+"/extra hr":"—";
    id("otGrossRate").textContent=cash(clamp(s.rate,0,10000,36.10)*clamp(s.otMultiplier,1,10,1.5))+"/OT hr";
    const message=id("otMessage");
    message.className="ot-message";
    const flags=[];
    if(a.firstDrop){
      flags.push("Returns drop at "+(a.firstDrop.hours-5)+"–"+a.firstDrop.hours+
        " hours: the next 5 hours add "+cash(a.firstDrop.extraNet)+
        ", about "+Math.max(0,a.firstDrop.dropPercent).toFixed(0)+"% less per hour than the first OT block.");
    } else {
      flags.push("No "+a.options.dropPercent+"% drop in extra take-home per hour was found from 40 to 70 hours.");
    }
    if(a.firstBelow){
      flags.push("Your "+cash(a.options.minimumNetHourly)+"/hour minimum is first missed in the "+
        (a.firstBelow.hours-5)+"–"+a.firstBelow.hours+" hour block ("+cash(a.firstBelow.perHour)+"/hour).");
    }
    message.textContent=flags.join(" ");
    if(a.firstDrop||a.firstBelow)message.classList.add("ot-message-notice");
    id("otEligibilityNote").textContent=
      a.options.qualifiedOT
      ? (a.options.filing==="separate"
        ? "Married filing separately: this tool does not apply the federal qualified overtime deduction."
        : "Estimated federal qualified overtime deduction is ON. Only the potentially eligible 0.5× overtime premium is counted; verify eligibility and reported wages.")
      : "Federal qualified overtime deduction is OFF until you confirm eligibility.";
    id("otModelNote").textContent=
      "2026 annual tax-liability estimate for "+a.options.weeks+
      " projected week(s), not paycheck withholding. Uses your saved pay rate and deductions. "+
      "Does not model child credits, itemized deductions, benefit FICA exemptions, other employers, or state-specific adjustments. "+
      "Other household income affects income-tax brackets but is not included in employee FICA. "+
      "Your money keeps increasing unless the displayed extra net says otherwise.";
  }
  const reload=()=>renderAnalyzer();
  id("hours").addEventListener("input",reload);
  document.querySelectorAll(".preset").forEach(button => button.addEventListener("click",reload));
  id("calculate").addEventListener("click",reload);
  id("saveSettings").addEventListener("click",reload);
  id("resetSettings").addEventListener("click",reload);
  renderAnalyzer();
  return api;
})();
