const socket = io();

const params = new URLSearchParams(location.search.substring(1));
const reactorName = params.get("reactor");
const token = Array.from(params)?.[0]?.[0];
socket.emit('auth', { token, reactor: reactorName, loc: 3 }); // Tell server who and where we are

var data, reactor;
var fuelDep; // Fuel depletion interval ID
var incomePS; // Income interval ID
var containmentDome; // Containment dome damage interval ID

initSound();

socket.on('auth', data_ => {
  if (data_ === false) {
    location.href = '/logout/' + token;
  }
});
socket.on('data', data_ => {
  data = data_;
  if (data.update) main();
});
socket.on("alert", ({ title, txt }) => displayMessage(title, txt));
socket.on("offline-earnings", ({ time, income }) => {
  displayMessage("Offline Earnings", `You were offline for ${fancyTimer(time)}, and this unit generated £${comma(income)} whilst you were away`);
});

const getData = () => data;

let initial = true;
function main() {
  reactor = data.user.reactors[reactorName];
  document.title = `RNMC - Unit ${reactorName}`;

    // General
  document.getElementById("reactor-est").innerText = new Date(reactor.est).toString().split(" GMT")[0];

  // Status info
  document.getElementById("stats-status-ok").innerText="0C";
  document.getElementById("stats-status-warning").innerText = `${reactor.TBwarning}C`;
  document.getElementById("stats-status-alert").innerText = `${reactor.TBalert}C`;
  document.getElementById("stats-status-critical").innerText = `${reactor.TBcritical}C`;

  // Max level info
  document.getElementById("reactor-size-lvl-limit").innerText = reactor.reactorSizeLvlLimit;
  document.getElementById("turbines-lvl-limit").innerText = reactor.turbineLvlLimit;
  document.getElementById("steam-lvl-limit").innerText = reactor.steamLvlLimit;
  document.getElementById("generators-lvl-limit").innerText = reactor.generatorLvlLimit;
  document.getElementById("fuel-rods-lvl-limit").innerText = reactor.fuelRodLifeLvlLimit;
  document.getElementById("containment-dome-lvl-limit").innerText = reactor.containmentDomeLvlLimit;
  document.body.setAttribute("status", reactor.status);
  document.querySelectorAll(".reactor-name").forEach(el => el.innerText = reactorName);

  if (initial) {
    dmgDome();
    setIncome();
    setFuelDep();
    editDemand(2);
    if (data.user.REACTOR_MOVE_TIME == true) setInterval(moveTime, data.user.REACTOR_MOVE_TIME_EVERY);

    document.getElementById("btn-repair-fuel").addEventListener("click", () => repair("fuel"));
    document.getElementById("btn-repair-dome").addEventListener("click", () => repair("containmentDome"));
    document.getElementById("btn-collect-money").addEventListener("click", () => collectMoney());
    document.getElementById("link-back").addEventListener("click", () => {
      saveProgress();
      location.href = "/?" + data.token;
    });
    document.getElementById("btn-controlRods-lower").addEventListener("click", () => controlRods("lower"));
    document.getElementById("btn-controlRods-raise").addEventListener("click", () => controlRods("raise"));
    document.getElementById("btn-controlRods-min").addEventListener("click", () => controlRods("TO:0"));
    document.getElementById("btn-controlRods-mid").addEventListener("click", () => controlRods("TO:50"));
    document.getElementById("btn-controlRods-max").addEventListener("click", () => controlRods("TO:100"));
    document.getElementById("btn-coolant-inc").addEventListener("click", () => coolantPumps("inc"));
    document.getElementById("btn-coolant-dec").addEventListener("click", () => coolantPumps("dec"));
    document.getElementById("btn-coolant-min").addEventListener("click", () => coolantPumps("TO:0"));
    document.getElementById("btn-coolant-mid").addEventListener("click", () => coolantPumps("TO:50"));
    document.getElementById("btn-coolant-max").addEventListener("click", () => coolantPumps("TO:100"));
    document.getElementById("btn-grid-connect").addEventListener("click", () => socket.emit("connect-grid", true));
    document.getElementById("btn-grid-disconnect").addEventListener("click", () => socket.emit("connect-grid", false));
  }

  _loadScreen();

  initial = false;
}

function num(a) { return +a; }
window.meltdownFunc = false;

function changePane(pane, caller) {
  const panes = document.querySelectorAll(".pane");
  for (let i = 0; i < panes.length; i++) { panes[i].style.display = 'none'; }
  let panesA = document.querySelectorAll(".a-pane");
  for (let i = 0; i < panesA.length; i++) { panesA[i].setAttribute("style", "background:none;color:#AAAEAD"); }
  document.getElementById(pane).style.display = 'block';
  caller.setAttribute("style", "background:blue;color:white;");
}

function meltdown() {
  if (window.meltdownFunc) return false;
  window.meltdownFunc = true;
  // Increase users' meltdown count
  data.user.meltdowns++;
  saveProgress();
  stopAlarms(true);
  Sounds.play("meltdown");
  document.body.setAttribute("status", "meltdown");
  Sounds.play("buzzer_alarm");
  document.querySelector(".meltdown-wrapper").style.display = "block";
  setTimeout(() => {
    Sounds.stop("buzzer_alarm");
    document.querySelector(".meltdown-wrapper").setAttribute("stage", "two");
    setTimeout(() => {
      Sounds.stop("meltdown");
      // reactor.meltedDown = true;
      // saveProgress();
      setTimeout(() => window.location.href = '/?' + data.token, 500);
    }, 9000);
  }, 5000);
}

function repair(item) {
  if (item == undefined) { return false; }
  if (reactor.controlRods === 0) {
    let cost, action;
    switch (item) {
      case 'fuel':
        cost = reactor.replaceFuelCost;
        action = () => {
          reactor.fuel = 100;
        };
        break;
      case 'containmentDome':
        cost = reactor.REPAIR_containmentDomeCost;
        action = () => {
          reactor.containmentDome = 100;
          reactor.containmentDomeStatus = "good";
          reactor.REPAIR_containmentDomeCost *= 2;
        };
        break;
      default:
        displayMessage("Unable to repair item", `Unknown item ${item}`);
    }
    if (typeof cost === "number") {
      if (data.user.money >= cost) {
        data.user.money -= cost;
        action();
        displayMessage("Repaired Item", `Repaired ${item} for £${comma(cost)}`);
        _loadScreen();
      } else {
        displayMessage("Insufficient funds", `It costs £${cost.toLocaleString("en-GB")} to repair ${item}`);
      }
    }
  } else {
    displayMessage("Unabel to repair item", "Core temperature must be at 0C");
  }
}

/** Play sound according to reactor status */
function playSound() {
  if (reactor.alarmStatus === "off") { return; }
  let playing = false;
  if (reactor.status === "warning" || reactor.containmentDomeStatus === "warning") {
    Sounds.playOnce("whoop");
    Sounds.stop("buzzer_alarm");
    Sounds.stop("missile_alert");
    playing = true;
  }
  if (reactor.status === "alert" || reactor.containmentDomeStatus === "alert") {
    Sounds.playOnce("buzzer_alarm");
    Sounds.stop("whoop");
    Sounds.stop("missile_alert");
    playing = true;
  }
  if (reactor.status === "critical" || reactor.containmentDomeStatus === "critical") {
    Sounds.playOnce("buzzer_alarm");
    Sounds.playOnce("missile_alert");
    Sounds.stop("whoop");
    playing = true;
  }
  if (!playing) {
    Sounds.stop("whoop");
    Sounds.stop("buzzer_alarm");
    Sounds.stop("missile_alert");
  }
}

function stopAlarms(simple) {
  Sounds.stop("whoop");
  Sounds.stop("buzzer_alarm");
  Sounds.stop("missile_alert");
  if (simple) { return; }
  data.user.reactors[reactorName].alarmStatus = "off";
  _loadScreen();
}
function startAlarms() {
  Sounds.play("beep");
  data.user.reactors[reactorName].alarmStatus = "on";
  _loadScreen();
  playSound();
}

/** Interval: deplete fuel */
function setFuelDep() {
  clearInterval(fuelDep);
  fuelDep = setInterval(setFuelDepDo, 10000);
}

/** Delete fuel */
function setFuelDepDo() {
  if (reactor.fuelDecrease > 0 && data.user.reactor_DEPLETE_FUEL && reactor.fuel > 0) {
    reactor.fuel -= reactor.fuelDecrease;
    _loadScreen();
  }
}

/** Interval: add income to total money generated */
function setIncome() {
  clearInterval(incomePS);
  incomePS = setInterval(setIncomeDo, 1000);
}

/** Add income to total money generated */
function setIncomeDo() {
  if (reactor.income > 0) {
    reactor.moneyGenerated = +reactor.moneyGenerated + reactor.income;
    reactor.totalMoneyGenerated = +reactor.totalMoneyGenerated + reactor.income;
    _loadScreen();
  }
}

/** Collect income money */
function collectMoney() {
  const MIN = 1000;
  if (reactor.moneyGenerated <= MIN) {
    displayMessage("Unfeesable Amount", `There must at least £${MIN} for you to collect the money`);
  } else {
    Sounds.play("cash");
    displayMessage("Collected Money", `Collected £${comma(reactor.moneyGenerated)}.`);
    data.user.money += reactor.moneyGenerated;
    reactor.moneyGenerated = 0;
    _loadScreen();
  }
}

/** Set interval for dome damage */
function dmgDome() {
  clearInterval(containmentDome);
  containmentDome = setInterval(dmgDomeDo, 1000);
}

/** Function to damage containent dome health */
function dmgDomeDo() {
  if (reactor.containmentDomeDmgRate > 0 && data.user.REACTOR_DO_DAMAGE) {
    setDomeHealth(reactor.containmentDome - reactor.containmentDomeDmgRate);
    if (reactor.containmentDomeStatus === "meltdown") meltdown();
    _loadScreen();
  }
}

function setDomeHealth(health) {
  reactor.containmentDome = health;
  reactor.containmentDomeStatus = getDomeStatus(health);
}

/** Simulate reactor: steam pressure, temperature */
function simulateReactor() {
  let temperature = (reactor.controlRods * reactor.fuelRodsMult) - (reactor.coolantPumps * reactor.coolantMult);
  let fuel = reactor.fuel;
  reactor.baseload = (reactor.TBwarning + reactor.baseloadConst) * reactor.numberOfGenerators;
  if (temperature < 1 || fuel < 1) {
    reactor.temperatureNumber = 0;
    reactor.steamPressure = 0;
    reactor.turbineRPM = 0;
    reactor.income = 0;
    reactor.powerOutput = 0;
    reactor.fuelDecrease = 0;
  } else {
    reactor.temperatureNumber = temperature;
    reactor.temperatureText = "stable";
    reactor.fuelDecrease = reactor.rFuelDecrease;
    if (temperature < 100) {
      reactor.steamPressure = 0;
      reactor.turbineRPM = 0;
      reactor.powerOutput = 0;
      reactor.income = 0;
      reactor.fuelDecrease = 0;
      return false;
    }
    reactor.steamPressure = (temperature * 3) * num(reactor.steamPressureMult);
    reactor.turbineRPM = reactor.steamPressure * 3 * reactor.turbineRPMMult * reactor.numberOfTurbines;
    reactor.powerOutput = +(((reactor.turbineRPM / 2) * reactor.generatorMult).toFixed(1)) * reactor.numberOfGenerators;
    if (reactor.connectedToGrid) {
      reactor.income = Math.round(((reactor.powerOutput / 60) / 60) * reactor.incomePerMWH);
    } else {
      reactor.income = 0;
    }

    if (reactor.powerOutput > reactor.demandLB && reactor.powerOutput <= reactor.demandUB) {
      reactor.meetingDemand = "yes";
      reactor.income = Math.round(reactor.income * reactor.demandRewardBoost);
    } else {
      reactor.meetingDemand = "no";
    }
  }

  // Temp status
  let fuelRodDec = reactor.fuelDecrease;
  if (temperature <= 0) { reactor.temperatureText = "null"; reactor.status = "null"; reactor.containmentDomeDmgRate = 0; fuelRodDec = 0; }
  if (temperature > 0) { reactor.temperatureText = "stable"; reactor.status = "OK"; reactor.containmentDomeDmgRate = 0; }
  if (temperature > reactor.TBwarning) { reactor.temperatureText = "high"; reactor.status = "warning"; reactor.containmentDomeDmgRate = 0.5; fuelRodDec += 0.1; }
  if (temperature > reactor.TBalert) { reactor.temperatureText = "very high"; reactor.status = "alert"; reactor.containmentDomeDmgRate = 1.5; fuelRodDec += 0.2; }
  if (temperature > reactor.TBcritical) { reactor.temperatureText = "critical"; reactor.status = "critical"; reactor.containmentDomeDmgRate = 3; fuelRodDec += 0.2; }
  if (temperature > reactor.TBmeltdown) {/*reactor.containmentDomeDmgRate = 100;*/ reactor.status = "meltdown"; meltdown(); }
  reactor.fuelDecrease = fuelRodDec;
}

/** Save data */
function saveProgress() {
  socket.emit("save", data.user);
}

function _loadScreen(redoDmgDome, redoIncome, redoFuelDep) {
  if (redoDmgDome) dmgDome();
  if (redoIncome) setIncome();
  if (redoFuelDep) setFuelDep();
  simulateReactor();
  saveProgress();
  playSound();
  document.body.setAttribute("status", reactor.status);

  // status
  for (let i of document.querySelectorAll(".status-text:not(.no)")) { i.setAttribute("status", reactor.status); i.innerText = reactor.status; }
  for (let i of document.querySelectorAll(".status-light:not(.no)")) { i.setAttribute("status", reactor.status); i.setAttribute("size", "tiny"); }
  document.querySelector("[i='status-text']").setAttribute("status", reactor.status);
  document.querySelector("[i='status-text']").innerText = reactor.status;
  document.querySelector("[i='status-light']").setAttribute("status", reactor.status);
  document.getElementById("alarm-status-text").setAttribute("state", reactor.alarmStatus);
  document.getElementById("alarm-status-text").innerText = `Alarms: ${reactor.alarmStatus}`;
  document.getElementById("alarm-status-light").setAttribute("state", reactor.alarmStatus);
  // Core temperature
  document.getElementById("temp-text-level").setAttribute("temp", reactor.temperatureText);
  document.getElementById("temp-text-level").innerText = reactor.temperatureText;
  document.getElementById("temp-bar-1").setAttribute("temp", reactor.temperatureText);
  document.querySelector("[i='temp-bar-fg']").setAttribute("temp", reactor.temperatureText);
  var temp_bar_width = ((reactor.temperatureNumber / reactor.TBalert) * 100).toFixed(2);
  if (temp_bar_width > 100) { temp_bar_width = 100; }
  document.querySelector("[i='temp-bar-fg']").setAttribute("style", `width:${temp_bar_width}%`)
  document.getElementById("temp-text-int").setAttribute("temp", reactor.temperatureNumber);
  document.getElementById("temp-text-int").innerHTML = `${comma(reactor.temperatureNumber)}C <small>(max ${reactor.TBwarning}C)</small>`;
  // Containment Dome
  document.getElementById("containment-status").setAttribute("status", reactor.containmentDomeStatus);
  document.getElementById("containment-status").innerText = reactor.containmentDomeStatus;
  document.getElementById("containment-light").setAttribute("status", reactor.containmentDomeStatus);
  document.getElementById("containment-meter").setAttribute("value", reactor.containmentDome);
  document.getElementById("containment-percent").innerText = `${reactor.containmentDome.toFixed(1)}%`;
  document.getElementById("containment-dmg-r8").innerText = `${reactor.containmentDomeDmgRate.toFixed(1)}%`;
  // Control rods
  document.getElementById("control-rods-meter").setAttribute("value", reactor.controlRods);
  document.getElementById("control-rods-percent").innerText = `${reactor.controlRods}%`;
  // Fuel Rods
  document.getElementById("fuel-life-text").innerText = `${num(reactor.fuel).toFixed(1)}%`;
  document.getElementById("fuel-life-meter").innerHTML = `<meter min='0' max='100' low="20" high="60" optimum="100" value='${reactor.fuel}' class='liquid-meter'></meter>`;
  document.getElementById("replace-fuel-cost").innerText = `£${comma(reactor.replaceFuelCost)}`;
  document.getElementById("fuel-dec-rate").innerText = `${reactor.fuelDecrease} %`;
  // Coolant pumps
  document.getElementById("coolant-pumps-meter").setAttribute("value", reactor.coolantPumps);
  document.getElementById("coolant-pumps-percent").innerText = `${reactor.coolantPumps}%`;
  // Steam pressure
  document.getElementById("steam-pressure-psi-text").innerText = `${comma(Math.round(reactor.steamPressure))} psi`;
  // Turbine
  document.getElementById("turbine-rpm-text-1").innerText = `${comma(Math.round(reactor.turbineRPM / reactor.numberOfTurbines))} rpm`;
  document.getElementById("turbine-rpm-text-all").innerText = `${comma(Math.round(reactor.turbineRPM))} rpm`;
  // Generator
  document.getElementById("generator-output-1").innerText = `${comma(Math.round(reactor.powerOutput / reactor.numberOfGenerators))} mW`;
  document.getElementById("generator-output-all").innerText = `${comma(Math.round(reactor.powerOutput))} mW`;
  // Demand
  document.getElementById("reactor-baseload").innerText = reactor.baseload;
  document.getElementById("meeting-demand").setAttribute("val", reactor.meetingDemand);
  document.getElementById("meeting-demand").innerText = reactor.meetingDemand;
  document.getElementById("meeting-demand-light").setAttribute("val", reactor.meetingDemand);
  document.getElementById("demand-bound").innerText = `${reactor.demandLB} - ${reactor.demandUB}`;
  if (reactor.meetingDemand == "yes") { document.getElementById("demand-bonus").innerHTML = `income &times; ${reactor.demandRewardBoost}`; } else { document.getElementById("demand-bonus").innerHTML = `-`; }
  if (reactor.oldDemand > reactor.demandLB) {
    document.getElementById("demand-inc-dec").innerHTML = `<DEC>&#9660; DEC ${((reactor.oldDemand - reactor.demandLB) / reactor.oldDemand).toFixed(2)}%</DEC>`;
  } else if (reactor.oldDemand < reactor.demandLB) {
    document.getElementById("demand-inc-dec").innerHTML = `<INC>&#9650; INC ${((reactor.demandLB - reactor.oldDemand) / reactor.oldDemand).toFixed(2)}%</INC>`;
  } else if (reactor.oldDemand == reactor.demandLB) {
    dir = "EQU";
    arrow = "&#9472;";
    document.getElementById("demand-inc-dec").innerHTML = `<EQU>EQUAL</EQU>`;
  }
  // Grid
  if (reactor.connectedToGrid) {
    document.getElementById("grid-connected").innerText = 'Connected to Grid';
    document.getElementById("grid-connected").setAttribute("state", "on");
    document.getElementById("grid-connected-light").setAttribute("state", "on");
  } else {
    document.getElementById("grid-connected").innerText = 'Disconnected from Grid';
    document.getElementById("grid-connected").setAttribute("state", "off");
    document.getElementById("grid-connected-light").setAttribute("state", "off");
  }
  // Income
  document.getElementById("income-text").innerText = `£ ${comma(reactor.income)}`;
  document.getElementById("income-per-MWH").innerText = `£ ${reactor.incomePerMWH}`;
  document.getElementById("offline-income-text").innerText = `£ ${comma(Math.round((reactor.income / 50) * data.user.offline_income_mult))}`;
  // Money to collect
  document.getElementById("collect-money").innerText = `£ ${comma(reactor.moneyGenerated)}`;
  document.getElementById("stats-money-generated").innerText = `£ ${comma(reactor.totalMoneyGenerated)}`;
  // repair Costs#
  document.getElementById("repair-dome-cost").innerText = "£" + comma(reactor.REPAIR_containmentDomeCost);
  // Containment dome upgrade
  document.getElementById("containment-current-level").innerText = reactor.containmentDomeLvl;
  document.getElementById("containment-next-level").innerText = reactor.containmentDomeLvl + 1;
  document.getElementById("containment-upgrade-cost").innerText = comma(reactor.containmentDomeUpgradeCost);
  // Generator upgrade
  document.getElementById("generator-mult").innerText = `${(reactor.generatorMult + 0.1).toFixed(1)}`;
  document.getElementById("generator-current-level").innerHTML = `${reactor.generatorLvl} (&times;${reactor.generatorMult})`;
  document.getElementById("generator-next-level").innerHTML = `${reactor.generatorLvl + 1} (&times;${(reactor.generatorMult + 0.1).toFixed(1)})`;
  document.getElementById("generator-upgrade-cost").innerText = comma(reactor.generatorUpgradeCost);
  // Turbine upgrade
  document.getElementById("turbine-mult").innerText = `${(reactor.turbineRPMMult + 0.1).toFixed(1)}`;
  document.getElementById("turbine-current-level").innerHTML = `${reactor.turbineLvl} (&times;${reactor.turbineRPMMult})`;
  document.getElementById("turbine-next-level").innerHTML = `${reactor.turbineLvl + 1} (&times;${(reactor.turbineRPMMult + 0.1).toFixed(1)})`;
  document.getElementById("turbine-upgrade-cost").innerText = comma(reactor.turbineUpgradeCost);
  // Steam upgrade
  document.getElementById("steam-mult").innerText = `${(reactor.steamPressureMult + 0.05).toFixed(2)}`;
  document.getElementById("steam-current-level").innerHTML = `${reactor.steamPressureLvl} (&times;${reactor.steamPressureMult})`;
  document.getElementById("steam-next-level").innerHTML = `${reactor.steamPressureLvl + 1} (&times;${(reactor.steamPressureMult + 0.05).toFixed(2)})`;
  document.getElementById("steam-upgrade-cost").innerText = comma(reactor.steamPressureUpgradeCost);
  // Reactor size upgrade
  document.getElementById("reactor-size-inc-how-many1").innerText = reactor.reactorSizeIncHowMany;
  document.getElementById("reactor-size-inc-how-many2").innerText = reactor.reactorSizeIncHowMany;
  document.getElementById("reactor-size-current-level").innerText = reactor.reactorSize;
  document.getElementById("reactor-size-next-level").innerText = reactor.reactorSize + 1;
  document.getElementById("reactor-size-upgrade-cost").innerText = comma(reactor.reactorSizeUpgradeCost);
  // Fuel rod upgrade
  document.getElementById("fuel-rod-current-life").innerText = `${reactor.rFuelDecrease} %`;
  document.getElementById("fuel-rod-next-life").innerText = `${(reactor.rFuelDecrease - 0.1).toFixed(1)} %`;
  document.getElementById("fuel-life-upgrade-cost").innerText = comma(reactor.fuelRodLifeUpgradeCost);
  // Extend info box
  document.getElementById("info-reactor-size").innerText = reactor.reactorSize;
  document.getElementById("info-turbine-support").innerText = reactor.howManyTurbinesSupport;
  document.getElementById("info-generator-support").innerText = reactor.howManyGeneratorsSupport;
  // Build turbine
  document.getElementById("current-no-turbines").innerText = reactor.numberOfTurbines;
  document.getElementById("turbine-cost").innerText = "£" + comma(reactor.buildTurbineCost);
  // Build Generators
  document.getElementById("current-no-generators").innerText = reactor.numberOfGenerators;
  document.getElementById("generator-cost").innerText = `£${comma(reactor.buildGeneratorCost)}`;
  // Time
  updateTime();
}

/** Control the control rods */
function controlRods(action) {
  let old = reactor.controlRods;
  if (action === "raise") {
    if (reactor.controlRods < 100) reactor.controlRods++;
  } else if (action === "lower") {
    if (reactor.controlRods > 0) reactor.controlRods--;
  } else if (action.startsWith("TO:")) {
    reactor.controlRods = +action.substring(3);
  }
  if (reactor.controlRods !== old) {
    _loadScreen();
  }
}

function coolantPumps(action) {
  let old = reactor.coolantPumps;
  if (action === "inc") {
    if (reactor.coolantPumps < 100) reactor.coolantPumps++;
  } else if (action === "dec") {
    if (reactor.coolantPumps > 0) reactor.coolantPumps--;
  } else if (action.startsWith("TO:")) {
    reactor.coolantPumps = +action.substring(3);
  }
  if (reactor.coolantPumps !== old) {
    _loadScreen();
  }
}

function connectToGrid(bool) {
  reactor.connectToGrid = bool;
  _loadScreen();
}

// TODO
function upgrade(item, cost) {
  return displayMessage("Coming Soon", "This feature is still under development");

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
      _loadScreen();
    } else {
      displayMessage("Unable to Upgrade Item", con.responseText);
    }
  }
  con.send();
}

// TODO
function build(item, cost) {
  return displayMessage("Coming Soon", "This feature is still under development");
  
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
      _loadScreen();
    } else {
      displayMessage("Unable to Build Item", con.responseText);
    }
  }
  con.send();
}

/** Advance simulation time */
function moveTime() {
  // Add one to hour (time)
  if (23 < num(data.user.time) + 1) {
    data.user.dayOfMonth = num(data.user.dayOfMonth) + 1, data.user.day = num(data.user.day) + 1, data.user.time = 0;
    editDemand(1);
    let R = random(1, 2);
    R == 2 && editDemand(2);
  } else { data.user.time = num(data.user.time) + 1; editDemand(1); }
  // Check if data.user.day > 6 - Sunday ===> (reset back to 0 - Mon)
  if (6 < num(data.user.day)) data.user.day = 0;
  // Check if too many days in month
  let maxDays = maxDaysOfMonths[data.user.month];
  num(data.user.dayOfMonth) > maxDays && (data.user.month = num(data.user.month) + 1, data.user.dayOfMonth = 1);
  // If months > 11 (december), reset do Jan
  11 < num(data.user.month) && (data.user.month = 0);
  // Time of day
  let time = num(data.user.time); var t;
  if (time == 0) t = "midnight";
  if (time >= 1) t = "night";
  if (time >= 4) t = "twilight";
  if (time >= 6) t = "morning";
  if (time == 12) t = "midday";
  if (time > 12) t = "afternoon";
  if (time >= 17) t = "evening";
  if (time >= 20) t = "twilight";
  if (time >= 22) t = "night";
  data.user.timeOfDay = t;
  saveProgress();
  updateTime();
}

/** Update time display */
function updateTime() {
  document.getElementById("time-text").innerHTML = `${days[data.user.day]} ${data.user.dayOfMonth} of ${months[data.user.month]} - ${data.user.time}:00 [${data.user.timeOfDay}]`;
  document.getElementById("stats-time-text").innerHTML = `${days[data.user.day]} ${data.user.dayOfMonth} of ${months[data.user.month]} - ${data.user.time}:00 [${data.user.timeOfDay}]`;
}

/** Edit demand according to the provided type: 1/2 */
function editDemand(type) {
  if (type == 1) {
    // add/minus time-of-day demand fract.
    let P = timeOfDayValues[data.user.timeOfDay];
    reactor.demandLB = +(reactor.demandLB * P).toFixed(1);
    reactor.demandUB = +(reactor.demandLB * P).toFixed(1);
    _loadScreen();
  } else if (type == 2) {
    // Redo whole demand
    reactor.oldDemand = reactor.demandLB;
    let rnd = random(1, 2), demandText, demandNum;
    if (rnd == 1) {
      demandText = choice(availableWeather[months[data.user.month]]);
      demandNum = weatherValues[demandText];
    } else if (rnd == 2) {
      demandText = choice(randomEvents);
      demandNum = randomEventsValues[demandText];
    }
    reactor.demandText = demandText;
    reactor.demandLB = Math.round(+reactor.baseload * demandNum);
    reactor.demandUB = Math.round((+reactor.baseload * demandNum) * 1.05);
    _loadScreen();
    // displayMessage("Demand Change", `The demand changed due to the following reason(s): <code>${REACTOR.demandText}</code>.`)
  }
}