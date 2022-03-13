const path = require("path");
const fs = require("fs");

const constants = JSON.parse(fs.readFileSync("data/constants.json", "utf-8"));

async function getUsers() {
  return new Promise(res => {
    fs.readFile("data/users.json", "utf-8", (e, x) => {
      res(JSON.parse(x));
    });
  });
}
async function updateUsers(userData) {
  return new Promise(res => {
    fs.writeFile("data/users.json", JSON.stringify(userData), "utf-8", () => res());
  });
}

module.exports = {
  constants: Object.freeze(constants),
  getUsers,
  updateUsers,
};