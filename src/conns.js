const data = require("./data.js");

class Connection {
  constructor(socket, data, sendDataOnInit = true) {
    this.socket = socket;
    this.data = data;
    if (sendDataOnInit) this.sendData(true);
  }

  /** Alert client */
  alert(title, txt) {
    this.socket.emit("alert", { title, txt });
  }

  /** Updates clients data */
  sendData(update) {
    this.socket.emit("data", { update, ...this.data });
  }

  /** Update contents of user data file */
  async updateUserDataFile() {
    await data.setUserData(this.data.username, this.data.user);
  }
}

// For index.html
class MainPageConnection extends Connection {
  constructor(socket, data, submitAuthOnInit = true) {
    super(socket, data, submitAuthOnInit);
    this._init();
  }

  _init() {
    // Comission a new reactor
    this.socket.on("comission", async ({ name }) => {
      if (this.data.user.money >= this.data.user.reactor_commission_price) {
        name = name.trim();
        if (name.length === 0 || !data.constants.name_regex.test(name)) {
          this.alert("Error", `Invalid reactor name provided\nMust match ${data.constants.name_regex}`);
        } else {
          if (name in this.data.user.reactors) {
            this.alert("Error", `Reactor with name ${name} already exists`);
          } else {
            this.data.user.money -= this.data.user.reactor_commission_price; // Decrease user money - "spent"
            this.data.user.alltime_reactors++;
            this.data.user.reactor_commission_price *= data.constants.reactor_comission_mult; // Increase price
            await this.updateUserDataFile();
            this.sendData(false);

            this.alert(`Reactor ${name} is being comissioned`, `Wait ${data.constants.reactor_commission_time / 1000} seconds`);
            setTimeout(async () => {
              data.createReactor(this.data.user, name);
              this.sendData(true);
              await this.updateUserDataFile();
            }, data.constants.reactor_commission_time);
          }
        }
      } else {
        this.alert("Insufficient funds!", `It costs £${this.data.user.reactor_commission_price.toLocaleString("en-GB")} to comission a new reactor.`);
      }
    });

    // Decomission a new reactor
    this.socket.on("decomission", async ({ name }) => {
      if (this.data.user.money >= this.data.user.reactor_decommission_price) {
        name = name.trim();
        if (name in this.data.user.reactors) {
          this.data.user.money -= this.data.user.reactor_decommission_price; // Decrease user money - "spent"
          this.data.user.reactor_commission_price /= data.constants.reactor_comission_mult; // Decrease price
          await this.updateUserDataFile();
          this.sendData(false);

          this.alert(`Reactor ${name} is being decomissioned`, `Wait ${data.constants.reactor_decommission_time / 1000} seconds`);
          setTimeout(async () => {
            delete this.data.user.reactors[name]; // Delete from Reactors object
            this.sendData(true);
            await this.updateUserDataFile();
          }, data.constants.reactor_decommission_time);
        } else {
          this.alert("Error", `No reactor with name ${name}.`);
        }
      } else {
        this.alert(`Insufficient funds!`, `It costs £${this.data.user.reactor_decommission_price.toLocaleString("en-GB")} to decomission a reactor.`);
      }
    });
  }
}

// For user.html
class UserPageConnection extends Connection {
  constructor(socket, data, submitAuthOnInit = true) {
    super(socket, data, submitAuthOnInit);
    this._init();
  }

  _init() {
    // Upgrade income multiplier
    this.socket.on("upgrade-income", async () => {
      if (this.data.user.money >= this.data.user.offline_income_mult_upgrade) {
        this.data.user.money -= this.data.user.offline_income_mult_upgrade;
        this.data.user.offline_income_mult_upgrade *= 2;
        this.data.user.offline_income_mult += data.constants.income_mult_next;
        this.sendData(true);
        await this.updateUserDataFile();
      } else {
        this.alert(`Insufficient funds!`, `It costs £${this.data.user.offline_income_mult_upgrade.toLocaleString("en-GB")} to upgrade your income multiplier.`);
      }
    });
  }
}

module.exports = {
  MainPageConnection,
  UserPageConnection,
};