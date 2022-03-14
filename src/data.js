const path = require("path");
const fs = require("fs");

const constants = JSON.parse(fs.readFileSync("data/constants.json", "utf-8"));

async function readJson(filename) {
  return new Promise(res => fs.readFile(path.join("data", filename), "utf-8", (e, x) => res(JSON.parse(x))));
}

async function writeJson(filename, obj) {
  return new Promise(res => fs.writeFile(path.join("data", filename), JSON.stringify(obj), () => res()));
}

async function delFile(filename) {
  return new Promise(res => fs.unlink(path.join("data", filename), () => res()));
}

const getUsers = async () => await readJson("users.json");
const updateUsers = async userData => await writeJson("users.json", userData);
const getUserData = async username => await readJson(`user-${username}.json`);
const setUserData = async (username, data) => await writeJson(`user-${username}.json`, data);
const userExists = async username => username in (await getUsers());

/** Return boolean success */
async function createUser(username, password) {
  const users = await getUsers();
  if (username in users) return false;
  users[username] = password;
  await updateUsers(users);

  const data = {
    money: constants.starting_money,
    reactors: {},
    alltime_reactors: 0,
    meltdowns: 0,
    start_date: Date.now(),
    giftbox: 0,
    offline_income_mult: 1,
    offline_income_mult_upgrade: 50000000,
    reactor_commission_price: 10000000,
    reactor_decommission_price: 15000000,
    month: 0,
    day: 0,
    dayOfMonth: 0,
    time: 12,
    timeOfDay: "midday",
    REACTOR_DO_DAMAGE: true,
    REACTOR_DEPLETE_FUEL: true,
    REACTOR_MOVE_TIME: true,
    REACTOR_MOVE_TIME_EVERY: 1e3,
  };
  await setUserData(username, data);

  return true;
}

/** Return boolean success */
async function delUser(username) {
  const users = await getUsers();
  if (username in users) {
    delete users[username];
    await updateUsers(users);
    await delFile(`user-${username}.json`);
    return true;
  } else {
    return false;
  }
}

/** Create reactor: only populate in JSON */
function createReactor(data, reactorName) {
  data.reactors[reactorName] = {
    mode: "off",
    status: "off",
    alarmStatus: "on",
    controlRods: 0,
    fuel: 100,
    fuelDecrease: 0,
    rFuelDecrease: 0.01,
    replaceFuelCost: 400000,
    coolantPumps: 0,
    temperatureNumber: 0,
    temperatureText: null,
    containmentDome: 100,
    containmentDomeStatus: "good",
    containmentDomeDmgRate: 0,
    REPAIR_containmentDomeCost: constants.repair_dome_cost,
    steamPressure: 0,
    turbineRPM: 0,
    powerOutput: 0,
    connectedToGrid: "yes",
    incomePerKWH: 0.13,
    incomePerMWH: 130,
    income: 0,
    moneyGenerated: 0,
    totalMoneyGenerated: 0,
    rMode: "normal",
    // Temperature boundaries
    TBwarning: 700,
    TBalert: 1000,
    TBcritical: 1200,
    TBmeltdown: 1300,
    // Multipliers
    fuelRodsMult: 15,
    coolantMult: 7,
    steamPressureMult: 1,
    turbineRPMMult: 1,
    generatorMult: 1,
    // Upgrades stuff
    fuelRodLifeLvl: 1,
    fuelRodLifeUpgradeCost: 500000,
    containmentDomeLvl: 1,
    containmentDomeUpgradeCost: 5000000,
    turbineLvl: 1,
    turbineUpgradeCost: 2500000,
    generatorLvl: 1,
    generatorUpgradeCost: 2500000,
    steamPressureLvl: 1,
    steamPressureUpgradeCost: 3750000,
    reactorSizeUpgradeCost: 10000000,
    reactorSizeIncHowMany: 2,
    reactorSize: 1,
    numberOfTurbines: 1,
    buildTurbineCost: 2500000,
    numberOfGenerators: 1,
    buildGeneratorCost: 2000000,
    howManyTurbinesSupport: 2,
    howManyGeneratorsSupport: 2,
    // Level Limiters
    containmentDomeLvlLimit: 3,
    fuelRodLifeLvlLimit: 5,
    turbineLvlLimit: 5,
    generatorLvlLimit: 5,
    reactorSizeLvlLimit: 3,
    steamLvlLimit: 5,
    // off-line income variables
    offline: "no",
    lastOnline: "",
    // Demand
    demandUB: "",
    demandLB: "",
    demandText: "",
    oldDemand: "",
    meetingDemand: "no",
    demandRewardBoost: 1.2,
    baseload: "",
    baseloadConst: 1750,
    // Reactor Time
    timeRunningNum: 0,
    timeRunningText: "",
    est: Date.now(),
  };
}

module.exports = {
  constants: Object.freeze(constants),
  getUsers,
  updateUsers,
  getUserData,
  setUserData,
  userExists,
  createUser,
  delUser,
  createReactor,
};