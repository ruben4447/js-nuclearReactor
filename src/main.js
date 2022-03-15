const express = require('express');
const session = require('express-session');
const socketio = require('socket.io');
const router = require('./router.js');
const uuid = require("uuid");
const auth = require('./auth.js');
const data = require("./data.js");
const conns = require("./conns.js");

const PORT = process.argv.length > 2 ? parseInt(process.argv[2]) : 3000;

const app = express();

app.use(session({
  secret: uuid.v4(),
  resave: true,
  saveUninitialized: true,
})); // Use express-session to enable user-remembering
app.use(express.urlencoded({ extended: true })); // Read form data
app.use('/', router); // Router - control traffic
app.use(express.static('./public/'));

const server = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
const io = socketio(server);

io.on("connection", socket => {
  console.log("New Connection: " + socket.id);

  let klass;
  socket.on("auth", async ({ token, loc, reactor }) => {
    if (klass === undefined) {
      if (auth.exists(token)) {
        switch (loc) {
          case 1:
            klass = new conns.MainPageConnection(socket, {
              token,
              username: auth.get(token),
              user: await data.getUserData(auth.get(token)),
              constants: data.constants
            });
            break;
          case 2:
            klass = new conns.UserPageConnection(socket, {
              token,
              username: auth.get(token),
              user: await data.getUserData(auth.get(token)),
              constants: data.constants
            });
            break;
          case 3:
            klass = new conns.ReactorPageConnection(socket, {
              token,
              reactor,
              username: auth.get(token),
              user: await data.getUserData(auth.get(token)),
              constants: data.constants
            });
            break;
          default:
            // Unknown request origin
            console.log(`<auth>  Invalid origin location - ${loc}`);
            socket.emit("auth", false);
        }
        if (klass) console.log(`<auth>  Forwarded connection to ${klass.constructor.name}`);
      } else {
        console.log(`<auth>  Invalid auth token - ${token}`);
        socket.emit("auth", false);
      }
    }
  });
  socket.on("create-account", async ({ username, password }) => {
    username = username.trim();
    password = password.trim();
    if (klass === undefined) {
      if (username.length === 0 || !new RegExp(data.constants.name_regex, "g").test(username)) {
        socket.emit("alert", { title: "Invalid Username", txt: `Must match ${new RegExp(data.constants.name_regex, "g")}` });
      } else if (password.length === 0 || !new RegExp(data.constants.name_regex, "g").test(password)) {
        socket.emit("alert", { title: "Invalid Password", txt: `Must match ${new RegExp(constants.name_regex, "g")}` });
      } else {
        let ok = await data.createUser(username, password);
        if (ok) {
          socket.emit("account-created", username);
        } else {
          socket.emit("creation-failed");
        }
      }
    }
  });
});