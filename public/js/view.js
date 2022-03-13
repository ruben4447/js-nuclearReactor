function qs(a) { return document.querySelector(a); }
function Body() { return document.body; }
function ID(a) { return qs(`#${a}`); }
function num(a) { return Number(a); }
window.meltdownFunc = false;

function changePane(pane, caller) {
  let PANES = document.querySelectorAll(".pane");
  for (var i = 0; i < PANES.length; i++) { PANES[i].style.display = 'none'; }
  let PANE_A = document.querySelectorAll(".a-pane");
  for (var i = 0; i < PANE_A.length; i++) { PANE_A[i].setAttribute("style", "background:none;color:#AAAEAD"); }
  ID(pane).style.display = 'block';
  caller.setAttribute("style", "background:blue;color:white;")
}

function _MELTDOWN_() {
  if (window.meltdownFunc == true) return false;
  window.meltdownFunc = true;
  // Increase users' meltdown count
  USER.meltdowns = num(USER.meltdowns) + 1;
  saveUserData(4447);
  stopAlarms(true);
  MELTDOWN.play();
  Body().setAttribute("status", "meltdown");
  MELTDOWN.play();
  BUZZER_ALARM.play();
  qs(".meltdown-wrapper").style.display = "block";
  setTimeout(() => {
    BUZZER_ALARM.pause();
    qs(".meltdown-wrapper").setAttribute("stage", "two");
    setTimeout(() => {
      MELTDOWN.pause();
      window.location.href = 'index.php?hadMeltdown=Yes';
      var CON = new XMLHttpRequest();
      CON.open("GET", `sql/del_reactor.php?token=666&name=${REACTOR.name}`);
      CON.onload = () => {
        window.location.href = 'index.php?hadMeltdown=Yes';
      }
      CON.send();
    }, 9000);
  }, 5000)
}

function repair(item, cost) {
  if (item == undefined) { return false; }
  if (num(REACTOR.controlRods) != 0) { displayMessage("Unable to Repair Item", `Unable to repair ${item}: core temperature must be 0C`); return false; }
  if (item == "fuel" && num(REACTOR.fuel) >= 50) { displayMessage("Unable to Replace Fuel Rods", `Cannot replace fuel rods as they are in a condition of 50% or better`); return false; }
  var con = new XMLHttpRequest();
  con.open("GET", `php/money.php?token=666b&action=DEC&amount=${cost}`);
  con.onload = () => {
    if (con.responseText == "OK") {
      switch (item) {
        case 'containmentDome':
          REACTOR.containmentDome = 100;
          REACTOR.containmentDomeStatus = "good";
          REACTOR.REPAIR_containmentDomeCost = num(REACTOR.REPAIR_containmentDomeCost) * 2;
          break;
        case 'fuel':
          REACTOR.fuel = 100;
          break;
        default:
          break;
      }
      _loadScreen(true);
    } else {
      displayMessage("Unable to Repair Item", con.responseText);
    }
  }
  con.send();
}

function playSound() {
  if (REACTOR.alarmStatus == "off") { return; }
  var status = REACTOR.status;
  stopAlarms(true);
  switch (status) {
    case 'warning':
      WHOOP.play();
      break;
    case 'alert':
      BUZZER_ALARM.play();
      break;
    case 'critical':
      BUZZER_ALARM.play();
      MISSILE_ALERT.play();
      break;
    default:
      WHOOP.pause();
      BUZZER_ALARM.pause();
      MISSILE_ALERT.pause();
  }
}

function stopAlarms(simple) {
  WHOOP.pause();
  BUZZER_ALARM.pause();
  MISSILE_ALERT.pause();
  if (simple == true) { return; }
  REACTOR.alarmStatus = "off";
  _loadScreen(true);
}
function startAlarms() {
  BEEP.play();
  REACTOR.alarmStatus = "on";
  _loadScreen(true);
  playSound();
}

// Depleting fuel
function setFuelDep() {
  clearInterval(fuelDep);
  fuelDep = setInterval(setFuelDepDo, 10000);
}
function setFuelDepDo() {
  let DEC = num(REACTOR.fuelDecrease);
  if (DEC > 0 && DEPLETE_FUEL == true) {
    REACTOR.fuel = num(REACTOR.fuel) - DEC;
    _loadScreen(true);
  }
}
// Adding income to moneyGenerated
function setIncome() {
  clearInterval(incomePS);
  incomePS = setInterval(setIncomeDo, 1000);
}
function setIncomeDo() {
  let income = num(REACTOR.income);
  if (income > 0) {
    REACTOR.moneyGenerated = num(REACTOR.moneyGenerated) + income;
    REACTOR.totalMoneyGenerated = num(REACTOR.totalMoneyGenerated) + income;
    _loadScreen(true);
  }
}
function collectMoney() {
  let money = num(REACTOR.moneyGenerated);
  if (money < 0) { return; }
  if (money < 1000) { displayMessage("Unfeesable Amount", "There must be over £1000 for you to collect the money"); return; }
  var con = new XMLHttpRequest();
  con.open("GET", `php/money.php?token=666b&action=INC&amount=${money}`);
  con.onload = () => {
    let text = con.responseText.trim();
    if (text == "OK") {
      CASH.play();
      displayMessage("Collected Money", `Collected £${comma(money)}.`);
      REACTOR.moneyGenerated = 0;
      _loadScreen(true);
    } else {
      displayMessage("Uh Oh", "Could not collect money: " + text);
    }
  }
  con.send();
}

// Damaging dome functions
function dmgDome() {
  clearInterval(containmentDome);
  containmentDome = setInterval(dmgDomeDo, 1000);
}
function dmgDomeDo() {
  let dmg = num(REACTOR.containmentDomeDmgRate);
  if (dmg > 0 && DO_DAMAGE == true) {
    let health = num(REACTOR.containmentDome) - dmg;
    REACTOR.containmentDome = health;
    console.warn(`Damaging Dome @ ${dmg}/s\n\t[Dome now @ ${health}%]`);
    if (health < 100) { REACTOR.containmentDomeStatus = "good"; }
    if (health < 30) { REACTOR.containmentDomeStatus = "warning"; }
    if (health < 10) { REACTOR.containmentDomeStatus = "alert"; }
    if (health < 5) { REACTOR.containmentDomeStatus = "critical"; }
    if (health < 1) { REACTOR.containmentDomeStatus = "meltdown"; _MELTDOWN_(); }
    _loadScreen(true);
  }
}

function OPS() {
  let temperature = (num(REACTOR.controlRods) * num(REACTOR.fuelRodsMult)) - (num(REACTOR.coolantPumps) * num(REACTOR.coolantMult));
  let fuel = num(REACTOR.fuel);
  REACTOR.baseload = (num(REACTOR.TBwarning) + num(REACTOR.baseloadConst)) * num(REACTOR.numberOfGenerators);
  if (temperature < 1 || fuel < 1) {
    REACTOR.temperatureNumber = 0;
    REACTOR.steamPressure = 0;
    REACTOR.turbineRPM = 0;
    REACTOR.income = 0;
    REACTOR.powerOutput = 0;
    REACTOR.fuelDecrease = 0;
  } else {
    REACTOR.temperatureNumber = temperature;
    REACTOR.temperatureText = "stable";
    REACTOR.fuelDecrease = num(REACTOR.rFuelDecrease);
    if (temperature < 100) {
      REACTOR.steamPressure = 0;
      REACTOR.turbineRPM = 0;
      REACTOR.powerOutput = 0;
      REACTOR.income = 0;
      REACTOR.fuelDecrease = 0;
      return false;
    }
    REACTOR.steamPressure = (temperature * 3) * num(REACTOR.steamPressureMult);
    REACTOR.turbineRPM = ((num(REACTOR.steamPressure) * 3) * num(REACTOR.turbineRPMMult)) * num(REACTOR.numberOfTurbines);
    REACTOR.powerOutput = (((num(REACTOR.turbineRPM) / 2) * num(REACTOR.generatorMult)).toFixed(1)) * num(REACTOR.numberOfGenerators);
    if (REACTOR.connectedToGrid == "yes") {
      REACTOR.income = Math.round(((num(REACTOR.powerOutput) / 60) / 60) * num(REACTOR.incomePerMWH));
    } else { REACTOR.income = 0; }

    if (REACTOR.powerOutput > REACTOR.demandLB && REACTOR.powerOutput <= REACTOR.demandUB) {
      REACTOR.meetingDemand = "yes";
      REACTOR.income = Math.round(num(REACTOR.income) * num(REACTOR.demandRewardBoost));
    } else {
      REACTOR.meetingDemand = "no";
    }
  }

  // Temp status
  var fuelRodDec = num(REACTOR.fuelDecrease);
  if (temperature <= 0) { REACTOR.temperatureText = "null"; REACTOR.status = "null"; REACTOR.containmentDomeDmgRate = 0; fuelRodDec = 0; }
  if (temperature > 0) { REACTOR.temperatureText = "stable"; REACTOR.status = "OK"; REACTOR.containmentDomeDmgRate = 0; }
  if (temperature > num(REACTOR.TBwarning)) { REACTOR.temperatureText = "high"; REACTOR.status = "warning"; REACTOR.containmentDomeDmgRate = 0.5; fuelRodDec += 0.1 }
  if (temperature > num(REACTOR.TBalert)) { REACTOR.temperatureText = "very high"; REACTOR.status = "alert"; REACTOR.containmentDomeDmgRate = 1.5; fuelRodDec += 0.2 }
  if (temperature > num(REACTOR.TBcritical)) { REACTOR.temperatureText = "critical"; REACTOR.status = "critical"; REACTOR.containmentDomeDmgRate = 3; fuelRodDec += 0.2 }
  if (temperature > num(REACTOR.TBmeltdown)) {/*REACTOR.containmentDomeDmgRate = 100;*/ REACTOR.status = "meltdown"; _MELTDOWN_(); }
  REACTOR.fuelDecrease = fuelRodDec;
}
function saveProgress(redirect, redirectURL) {
  // Save reactor object
  let DATA = JSON.stringify(REACTOR);
  var CON = new XMLHttpRequest();
  CON.open("POST", `php/saveProgress.php?token=666&r=${REACTOR.name}`);
  CON.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  CON.onload = () => {
    //console.log(`<<<[!] ${CON.responseText} >>>`);
    if (redirect == true) {
      REACTOR.offline = "yes";
      let t = new Date();
      REACTOR.lastOnline = t.getTime();
      saveProgress(false);
      window.location.href = redirectURL;
    }
  }
  CON.send(encodeURI(`json=${DATA}`));
}

function saveUserData(code) {
  // Save User object
  let DATA = JSON.stringify(USER);
  var CON = new XMLHttpRequest();
  CON.open("POST", `php/saveUserData.php?token=666999&pass=1994&auth=${code}`);
  CON.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  CON.onload = () => {
    //console.log(`<<<[!!] ${CON.responseText} >>>`);
  }
  CON.send(encodeURI(`json=${DATA}`));
}

function _loadScreen(save, redoDmgDome, redoIncome, redoFuelDep) {
  if (save == true) saveProgress();
  if (redoDmgDome == true) dmgDome();
  if (redoIncome == true) setIncome();
  if (redoFuelDep == true) setFuelDep();
  OPS();
  playSound();
  Body().setAttribute("status", REACTOR.status);

  // status
  for (var i of document.querySelectorAll(".status-text:not(.no)")) i.setAttribute("status", REACTOR.status), i.innerText = REACTOR.status;
  for (var i of document.querySelectorAll(".status-light:not(.no)")) i.setAttribute("status", REACTOR.status), i.setAttribute("size", "tiny");
  qs("[i='status-text']").setAttribute("status", REACTOR.status);
  qs("[i='status-text']").innerText = REACTOR.status;
  qs("[i='status-light']").setAttribute("status", REACTOR.status);
  ID("alarm-status-text").setAttribute("state", REACTOR.alarmStatus);
  ID("alarm-status-text").innerText = `Alarms: ${REACTOR.alarmStatus}`;
  ID("alarm-status-light").setAttribute("state", REACTOR.alarmStatus);
  // Core temperature
  ID("temp-text-level").setAttribute("temp", REACTOR.temperatureText);
  ID("temp-text-level").innerText = REACTOR.temperatureText;
  ID("temp-bar-1").setAttribute("temp", REACTOR.temperatureText);
  qs("[i='temp-bar-fg']").setAttribute("temp", REACTOR.temperatureText);
  var temp_bar_width = ((num(REACTOR.temperatureNumber) / num(REACTOR.TBalert)) * 100).toFixed(2);
  if (temp_bar_width > 100) { temp_bar_width = 100; }
  qs("[i='temp-bar-fg']").setAttribute("style", `width:${temp_bar_width}%`)
  ID("temp-text-int").setAttribute("temp", REACTOR.temperatureNumber);
  ID("temp-text-int").innerHTML = `${comma(REACTOR.temperatureNumber)}C <small>(max ${REACTOR.TBwarning}C)</small>`;
  // Containment Dome
  ID("containment-status").setAttribute("status", REACTOR.containmentDomeStatus);
  ID("containment-status").innerText = REACTOR.containmentDomeStatus;
  ID("containment-light").setAttribute("status", REACTOR.containmentDomeStatus);
  ID("containment-meter").setAttribute("value", REACTOR.containmentDome);
  ID("containment-percent").innerText = `${num(REACTOR.containmentDome).toFixed(1)}%`;
  ID("containment-dmg-r8").innerText = `${num(REACTOR.containmentDomeDmgRate).toFixed(1)}%`;
  // Control rods
  ID("control-rods-meter").setAttribute("value", REACTOR.controlRods);
  ID("control-rods-percent").innerText = `${REACTOR.controlRods}%`;
  // Fuel Rods
  ID("fuel-life-text").innerText = `${num(REACTOR.fuel).toFixed(1)}%`;
  ID("fuel-life-meter").innerHTML = `<meter min='0' max='100' low="20" high="60" optimum="100" value='${REACTOR.fuel}' class='liquid-meter'></meter>`;
  ID("replace-fuel-cost").innerText = `£${comma(REACTOR.replaceFuelCost)}`;
  ID("fuel-dec-rate").innerText = `${REACTOR.fuelDecrease} %`;
  // Coolant pumps
  ID("coolant-pumps-meter").setAttribute("value", REACTOR.coolantPumps);
  ID("coolant-pumps-percent").innerText = `${REACTOR.coolantPumps}%`;
  // Steam pressure
  ID("steam-pressure-psi-text").innerText = `${comma(Math.round(REACTOR.steamPressure))} psi`;
  // Turbine
  ID("turbine-rpm-text-1").innerText = `${comma(Math.round(num(REACTOR.turbineRPM) / num(REACTOR.numberOfTurbines)))} rpm`;
  ID("turbine-rpm-text-all").innerText = `${comma(Math.round(REACTOR.turbineRPM))} rpm`;
  // Generator
  ID("generator-output-1").innerText = `${comma(Math.round(num(REACTOR.powerOutput) / num(REACTOR.numberOfGenerators)))} mW`;
  ID("generator-output-all").innerText = `${comma(Math.round(REACTOR.powerOutput))} mW`;
  // Demand
  ID("reactor-baseload").innerText = REACTOR.baseload;
  ID("meeting-demand").setAttribute("val", REACTOR.meetingDemand);
  ID("meeting-demand").innerText = REACTOR.meetingDemand;
  ID("meeting-demand-light").setAttribute("val", REACTOR.meetingDemand);
  ID("demand-bound").innerText = `${REACTOR.demandLB} - ${REACTOR.demandUB}`;
  if (REACTOR.meetingDemand == "yes") { ID("demand-bonus").innerHTML = `income &times; ${REACTOR.demandRewardBoost}`; } else { ID("demand-bonus").innerHTML = `-`; }
  if (num(REACTOR.oldDemand) > num(REACTOR.demandLB)) {
    ID("demand-inc-dec").innerHTML = `<DEC>&#9660; DEC ${((num(REACTOR.oldDemand) - num(REACTOR.demandLB)) / num(REACTOR.oldDemand)).toFixed(2)}%</DEC>`;
  } else if (num(REACTOR.oldDemand) < num(REACTOR.demandLB)) {
    ID("demand-inc-dec").innerHTML = `<INC>&#9650; INC ${((num(REACTOR.demandLB) - num(REACTOR.oldDemand)) / num(REACTOR.oldDemand)).toFixed(2)}%</INC>`;
  } else if (num(REACTOR.oldDemand) == num(REACTOR.demandLB)) {
    dir = "EQU"; arrow = "&#9472;";
    ID("demand-inc-dec").innerHTML = `<EQU>EQUAL</EQU>`;
  }
  // Grid
  if (REACTOR.connectedToGrid == "yes") {
    ID("grid-connected").innerText = 'Connected to Grid';
    ID("grid-connected").setAttribute("state", "on")
    ID("grid-connected-light").setAttribute("state", "on")
  } else if (REACTOR.connectedToGrid == "no") {
    ID("grid-connected").innerText = 'Disconnected from Grid';
    ID("grid-connected").setAttribute("state", "off")
    ID("grid-connected-light").setAttribute("state", "off")
  }
  // Income
  ID("income-text").innerText = `£ ${comma(REACTOR.income)}`;
  ID("income-per-MWH").innerText = `£ ${REACTOR.incomePerMWH}`;
  ID("offline-income-text").innerText = `£ ${comma(Math.round((num(REACTOR.income) / 50) * num(USER.offline_income_mult)))}`;
  // Money to collect
  ID("collect-money").innerText = `£ ${comma(REACTOR.moneyGenerated)}`;
  ID("stats-money-generated").innerText = `£ ${comma(REACTOR.totalMoneyGenerated)}`;
  // repair Costs#
  ID("repair-dome-cost").innerText = "£" + comma(REACTOR.REPAIR_containmentDomeCost);
  // Containment dome upgrade
  ID("containment-current-level").innerText = REACTOR.containmentDomeLvl;
  ID("containment-next-level").innerText = num(REACTOR.containmentDomeLvl) + 1;
  ID("containment-upgrade-cost").innerText = comma(REACTOR.containmentDomeUpgradeCost);
  // Generator upgrade
  ID("generator-mult").innerText = `${(num(REACTOR.generatorMult) + 0.1).toFixed(1)}`;
  ID("generator-current-level").innerHTML = `${REACTOR.generatorLvl} (&times;${REACTOR.generatorMult})`;
  ID("generator-next-level").innerHTML = `${num(REACTOR.generatorLvl) + 1} (&times;${(num(REACTOR.generatorMult) + 0.1).toFixed(1)})`;
  ID("generator-upgrade-cost").innerText = comma(REACTOR.generatorUpgradeCost);
  // Turbine upgrade
  ID("turbine-mult").innerText = `${(num(REACTOR.turbineRPMMult) + 0.1).toFixed(1)}`;
  ID("turbine-current-level").innerHTML = `${REACTOR.turbineLvl} (&times;${REACTOR.turbineRPMMult})`;
  ID("turbine-next-level").innerHTML = `${num(REACTOR.turbineLvl) + 1} (&times;${(num(REACTOR.turbineRPMMult) + 0.1).toFixed(1)})`;
  ID("turbine-upgrade-cost").innerText = comma(REACTOR.turbineUpgradeCost);
  // Steam upgrade
  ID("steam-mult").innerText = `${(num(REACTOR.steamPressureMult) + 0.05).toFixed(2)}`;
  ID("steam-current-level").innerHTML = `${REACTOR.steamPressureLvl} (&times;${REACTOR.steamPressureMult})`;
  ID("steam-next-level").innerHTML = `${num(REACTOR.steamPressureLvl) + 1} (&times;${(num(REACTOR.steamPressureMult) + 0.05).toFixed(2)})`;
  ID("steam-upgrade-cost").innerText = comma(REACTOR.steamPressureUpgradeCost);
  // Reactor size upgrade
  ID("reactor-size-inc-how-many1").innerText = REACTOR.reactorSizeIncHowMany;
  ID("reactor-size-inc-how-many2").innerText = REACTOR.reactorSizeIncHowMany;
  ID("reactor-size-current-level").innerText = REACTOR.reactorSize;
  ID("reactor-size-next-level").innerText = num(REACTOR.reactorSize) + 1;
  ID("reactor-size-upgrade-cost").innerText = comma(REACTOR.reactorSizeUpgradeCost);
  // Fuel rod upgrade
  ID("fuel-rod-current-life").innerText = `${REACTOR.rFuelDecrease} %`;
  ID("fuel-rod-next-life").innerText = `${(num(REACTOR.rFuelDecrease) - 0.1).toFixed(1)} %`;
  ID("fuel-life-upgrade-cost").innerText = comma(REACTOR.fuelRodLifeUpgradeCost);
  // Extend info box
  ID("info-reactor-size").innerText = REACTOR.reactorSize;
  ID("info-turbine-support").innerText = REACTOR.howManyTurbinesSupport;
  ID("info-generator-support").innerText = REACTOR.howManyGeneratorsSupport;
  // Build turbine
  ID("current-no-turbines").innerText = REACTOR.numberOfTurbines;
  ID("turbine-cost").innerText = "£" + comma(REACTOR.buildTurbineCost);
  // Build Generators
  ID("current-no-generators").innerText = REACTOR.numberOfGenerators;
  ID("generator-cost").innerText = `£${comma(REACTOR.buildGeneratorCost)}`;
  // Time
  updateTime();
}

function controlRods(action) {
  let current = num(REACTOR.controlRods);
  if (action == "raise") {
    let NEW = current + 1;
    100 < NEW ? null : (REACTOR.controlRods = num(REACTOR.controlRods) + 1, _loadScreen(!0));
  } else if (action == "lower") {
    let NEW = current - 1;
    0 > NEW ? null : (REACTOR.controlRods = num(REACTOR.controlRods) - 1, _loadScreen(!0));
  } else if (action.match("TO")) {
    REACTOR.controlRods = action.replace("TO:", "");
    _loadScreen(true);
  }
}

function coolantPumps(action) {
  let current = num(REACTOR.coolantPumps);
  if (action == "INC") {
    let NEW = current + 1;
    100 < NEW ? null : (REACTOR.coolantPumps = num(REACTOR.coolantPumps) + 1, _loadScreen(!0));
  } else if (action == "DEC") {
    let NEW = current - 1;
    0 > NEW ? null : (REACTOR.coolantPumps = num(REACTOR.coolantPumps) - 1, _loadScreen(!0));
  } else if (action.match("TO")) {
    REACTOR.coolantPumps = action.replace("TO:", "");
    _loadScreen(true);
  }
}

function changeGrid(to) {
  "yes" == to && (REACTOR.connectedToGrid = "yes");
  "no" == to && (REACTOR.connectedToGrid = "no");
  _loadScreen(true);
}

function upgrade(item, cost) {
  // Check if any of the levels are above the max
  let max, lvl;
  switch (item) {
    case 'containment_dome': max = REACTOR.containmentDomeLvlLimit; lvl = REACTOR.containmentDomeLvl; break;
    case 'generator': max = REACTOR.generatorLvlLimit; lvl = REACTOR.generatorLvl; break;
    case 'turbine': max = REACTOR.turbineLvlLimit; lvl = REACTOR.turbineLvl; break;
    case 'steam': max = REACTOR.steamLvlLimit; lvl = REACTOR.steamPressureLvl; break;
    case 'reactor_size': max = REACTOR.reactorSizeLvlLimit; lvl = REACTOR.reactorSize; break;
    case 'fuel_rods': max = REACTOR.fuelRodLifeLvlLimit; lvl = REACTOR.fuelRodLifeLvl; break;
    default: return false; break;
  }
  let nextLvl = num(lvl) + 1;
  if (nextLvl > num(max)) { displayMessage("Unable to Upgrade Item", `Cannot upgrade ${item} as it is already max level [Level ${max}]`); return false; }
  var con = new XMLHttpRequest();
  con.open("GET", `php/money.php?token=666b&action=DEC&amount=${cost}`);
  con.onload = () => {
    if (con.responseText == "OK") {
      switch (item) {
        case 'containment_dome':
          REACTOR.containmentDomeLvl = num(REACTOR.containmentDomeLvl) + 1;
          REACTOR.containmentDomeUpgradeCost = num(REACTOR.containmentDomeUpgradeCost) * 2;
          REACTOR.TBwarning = num(REACTOR.TBwarning) + 120;
          REACTOR.TBalert = num(REACTOR.TBalert) + 120;
          REACTOR.TBcritical = num(REACTOR.TBcritical) + 120;
          REACTOR.TBmeltdown = num(REACTOR.TBmeltdown) + 120;
          break;
        case 'generator':
          REACTOR.generatorLvl = num(REACTOR.generatorLvl) + 1;
          REACTOR.generatorUpgradeCost = num(REACTOR.generatorUpgradeCost) * 2;
          REACTOR.generatorMult = (num(REACTOR.generatorMult) + 0.1).toFixed(1);
          break;
        case 'turbine':
          console.log("Upgrading turbine");
          REACTOR.turbineLvl = num(REACTOR.turbineLvl) + 1;
          REACTOR.turbineUpgradeCost = num(REACTOR.turbineUpgradeCost) * 2;
          REACTOR.turbineRPMMult = (num(REACTOR.turbineRPMMult) + 0.1).toFixed(1);
          break;
        case 'steam':
          console.log("Upgrading Steam")
          REACTOR.steamPressureLvl = num(REACTOR.steamPressureLvl) + 1;
          REACTOR.steamPressureUpgradeCost = num(REACTOR.steamPressureUpgradeCost) * 2;
          REACTOR.steamPressureMult = (num(REACTOR.steamPressureMult) + 0.05).toFixed(1);
          break;
        case 'reactor_size':
          REACTOR.reactorSize = num(REACTOR.reactorSize) + 1;
          REACTOR.howManyTurbinesSupport = num(REACTOR.howManyTurbinesSupport) + num(REACTOR.reactorSizeIncHowMany);
          REACTOR.howManyGeneratorsSupport = num(REACTOR.howManyGeneratorsSupport) + num(REACTOR.reactorSizeIncHowMany);
          REACTOR.reactorSizeUpgradeCost = Math.round(num(REACTOR.reactorSizeUpgradeCost) * 2.5);
          break;
        case 'fuel_rods':
          REACTOR.fuelRodLifeLvl = num(REACTOR.fuelRodLifeLvl) + 1;
          REACTOR.rFuelDecrease = num(num(REACTOR.rFuelDecrease) - 0.1).toFixed(1);
          REACTOR.fuelRodLifeUpgradeCost = num(REACTOR.fuelRodLifeUpgradeCost) * 2;
          break;
      }
      _loadScreen(true);
    } else {
      displayMessage("Unable to Upgrade Item", con.responseText);
    }
  }
  con.send();
}

function build(item, cost) {
  // Check if they are over the max limit
  if (item == "turbine") {
    if ((num(REACTOR.numberOfTurbines) + 1) > num(REACTOR.howManyTurbinesSupport)) {
      displayMessage("Unable to Build Turbine", `You have reached the maximum number of turbines for this size reactor. Upgrade reactor size to build more turbines`);
      return false;
    }
  } else if (item == "generator") {
    if ((num(REACTOR.numberOfGenerators) + 1) > num(REACTOR.howManyGeneratorsSupport)) {
      displayMessage("Unable to Build generator", `You have reached the maximum number of generators for this size reactor. Upgrade reactor size to build more generators`);
      return false;
    }
  } else { return false; }
  var con = new XMLHttpRequest();
  con.open("GET", `php/money.php?token=666b&action=DEC&amount=${cost}`);
  con.onload = () => {
    console.log(con.responseText)
    if (con.responseText == "OK") {
      switch (item) {
        case 'turbine':
          REACTOR.numberOfTurbines = num(REACTOR.numberOfTurbines) + 1;
          REACTOR.buildTurbineCost = num(REACTOR.buildTurbineCost) * 2;
          break;
        case 'generator':
          REACTOR.numberOfGenerators = num(REACTOR.numberOfGenerators) + 1;
          REACTOR.buildGeneratorCost = num(REACTOR.buildGeneratorCost) * 2;
          break;
      }
      _loadScreen(true);
    } else {
      displayMessage("Unable to Build Item", con.responseText);
    }
  }
  con.send();
}
function calculateOfflineIncome(oldTime, newTime) {
  const difference = Math.round((newTime - oldTime) / 1e3);
  let fancy = fancyTimer(difference);
  const incomePerS = num(REACTOR.income);
  const raw_income = difference * incomePerS;
  const income = Math.round((raw_income / 50) * num(USER.offline_income_mult));
  displayMessage("Offline Earnings", `You were offline for ${fancy}, and this unit generated £${comma(income)} whilst you were away`);
  REACTOR.moneyGenerated = num(REACTOR.moneyGenerated) + num(income);
  REACTOR.totalMoneyGenerated = num(REACTOR.totalMoneyGenerated) + num(income);
  _loadScreen(true);
}
function moveTime() {
  // Add one to hour (time)
  if (23 < num(USER.time) + 1) {
    USER.dayOfMonth = num(USER.dayOfMonth) + 1, USER.day = num(USER.day) + 1, USER.time = 0;
    editDemand(1);
    let R = random(1, 2);
    console.log(`NUMBER: ${R} (${R == 2})`)
    R == 2 && editDemand(2);
  } else { USER.time = num(USER.time) + 1; editDemand(1); }
  // Check if USER.day > 6 - Sunday ===> (reset back to 0 - Mon)
  if (6 < num(USER.day)) USER.day = 0;
  // Check if too many days in month
  let maxDays = maxDaysOfMonths[USER.month];
  num(USER.dayOfMonth) > maxDays && (USER.month = num(USER.month) + 1, USER.dayOfMonth = 1);
  // If months > 11 (december), reset do Jan
  11 < num(USER.month) && (USER.month = 0);
  // Time of day
  let time = num(USER.time); var t;
  if (time == 0) t = "midnight";
  if (time >= 1) t = "night";
  if (time >= 4) t = "twilight";
  if (time >= 6) t = "morning";
  if (time == 12) t = "midday";
  if (time > 12) t = "afternoon";
  if (time >= 17) t = "evening";
  if (time >= 20) t = "twilight";
  if (time >= 22) t = "night";
  USER.timeOfDay = t;
  saveUserData(4447);
  updateTime();
}
function updateTime() {
  ID("time-text").innerHTML = `${days[USER.day]} ${USER.dayOfMonth} of ${months[USER.month]} - ${USER.time}:00 [${USER.timeOfDay}]`;
  ID("stats-time-text").innerHTML = `${days[USER.day]} ${USER.dayOfMonth} of ${months[USER.month]} - ${USER.time}:00 [${USER.timeOfDay}]`;
}
function editDemand(type) {
  if (type == 1) {
    // add/minus time-of-day demand fract.
    let P = timeOfDayValues[USER.timeOfDay];
    //console.log(`Time of Day Factor: ${P}`);
    REACTOR.demandLB = (num(REACTOR.demandLB) * P).toFixed(1);
    REACTOR.demandUB = (num(REACTOR.demandLB) * P).toFixed(1);
    _loadScreen(true);
  } else if (type == 2) {
    // Redo whole demand
    REACTOR.oldDemand = REACTOR.demandLB;
    console.warn("Editing Demand");
    const rnd = random(1, 2);
    if (rnd == 1) {
      var demandText = choice(availableWeather[months[USER.month]]);
      var demandNum = weatherValues[demandText];
    } else if (rnd == 2) {
      var demandText = choice(randomEvents);
      var demandNum = randomEventsValues[demandText];
    }
    REACTOR.demandText = demandText;
    REACTOR.demandLB = Math.round(num(REACTOR.baseload) * demandNum);
    REACTOR.demandUB = Math.round((num(REACTOR.baseload) * demandNum) * 1.05);
    //console.log(`Main Event Factor: ${demandNum}`)
    _loadScreen(true);
    displayMessage("Demand Change", `The demand changed due to the following reason(s): <code>${REACTOR.demandText}</code>.`)
  }
}

Body().setAttribute("status", REACTOR.status);
_loadScreen(), dmgDome(), setIncome(), setFuelDep(), editDemand(2);
if (MOVE_TIME == true) setInterval(moveTime, MOVE_TIME_EVERY);

// If user registered as offline - sort out income
if (REACTOR.offline == "yes") {
  let nowD = new Date,
    now = num(nowD.getTime());
  calculateOfflineIncome(num(REACTOR.lastOnline), now);
  REACTOR.offline = "no";
  REACTOR.lastOnline = 0;
}
