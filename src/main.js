const express = require('express');
const session = require('express-session');
const socketio = require('socket.io');
const router = require('./router.js');
const uuid = require("uuid");
const auth = require('./auth.js');

const data = require("./data.js");

const PORT = 3000;

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
  socket.on("auth", ({ token, loc }) => {
    if (klass === undefined) {
      if (auth.exists(token)) {
        socket.emit("auth", {

        });
      } else {
        socket.emit("auth", false);
      }
    }
  });
});