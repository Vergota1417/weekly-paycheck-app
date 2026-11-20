"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const {test} = require("node:test");

const app = fs.readFileSync(path.join(__dirname, "..", "overtime.js"), "utf8");
// The browser controller returns its pure calculation API when no DOM exists.
const engine = vm.runInNewContext(app, {Intl});
const pay = {rate:36.10,otStart:40,otMultiplier:1.5,fixedPreTax:176.80,variablePreTax:4,postTax:1.13};

test("2026 federal tax brackets are progressive", () => {
  assert.equal(engine.federalProgressive(12400,engine.TAX.brackets.single),1240);
  assert.equal(engine.federalProgressive(50400,engine.TAX.brackets.single),5800);
  assert.equal(engine.federalProgressive(50500,engine.TAX.brackets.single),5822);
});

test("first 5 overtime hours gross $270.75", () => {
  const a=engine.analyzeHours({filing:"single",weeks:52},pay);
  assert.equal(a.rows.length,7);
  assert.equal(a.rows[1].extraGross,270.75);
});

test("overtime adds money while marginal retained value can shrink", () => {
  const a=engine.analyzeHours({filing:"single",weeks:52,qualifiedOT:true},pay);
  assert.ok(a.rows.every((row,i)=>i===0 || row.extraNet>0));
  assert.ok(a.rows[1].perHour>a.rows[6].perHour);
  assert.ok(a.firstDrop);
});

test("qualified federal overtime deduction is opt-in and capped", () => {
  const none=engine.scenario(55,{qualifiedOT:false},pay);
  const eligible=engine.scenario(55,{qualifiedOT:true},pay);
  assert.equal(none.overtimeDeduction,0);
  assert.equal(eligible.overtimeDeduction,12500);
  assert.ok(eligible.weeklyNet>none.weeklyNet);
  assert.equal(eligible.taxes.fica,none.taxes.fica);
  assert.equal(eligible.taxes.state,none.taxes.state);
});

test("married filing separately does not receive deduction", () => {
  assert.equal(engine.scenario(55,{filing:"separate",qualifiedOT:true},pay).overtimeDeduction,0);
});

test("user-configurable 2026 year-to-date wage projection is stable", () => {
  const a=engine.analyzeHours({filing:"joint",weeks:6,earnedYTD:95000,pretaxYTD:1800,
    otherIncome:50000,qualifiedOT:false},pay);
  assert.equal(a.rows.length,7);
  assert.ok(a.rows.every(row=>Number.isFinite(row.weeklyNet)));
  assert.ok(a.rows[1].extraNet>0);
});

test("all supported filing types and state exemption settings are finite", () => {
  for(const filing of ["single","joint","head","separate"]){
    for(const exemptions of [0,1,2,4]){
      const r=engine.scenario(60,{filing,weeks:52,stateExemptions:exemptions},pay);
      assert.ok(Number.isFinite(r.weeklyNet));
    }
  }
});

test("DOM references and offline assets match the page", () => {
  const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
  const worker=fs.readFileSync(path.join(__dirname,"..","service-worker.js"),"utf8");
  assert.match(html,/id="otAnalyzer"/);
  assert.match(html,/src="\.\/overtime\.js"/);
  assert.match(worker,/"\.\/overtime\.js"/);
  for(const id of ["otRows","otBest","otBestRate","otGrossRate","otFiling","otWeeks",
     "otEligible","otEarnedYTD","otPretaxYTD","otPremiumYTD","otExemptions","otMinHourly"]){
    assert.ok(html.includes('id="'+id+'"'),"missing input "+id);
  }
});
