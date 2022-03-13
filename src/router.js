const express = require('express');
const data = require('./data.js');
const auth = require('./auth.js');

const router = express.Router();

router.get('/', async (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login.html");
  }
});

// Login request
router.post('/login', async (req, res, next) => {
  const users = await data.getUsers();
  let incorrect;
  console.log(`[LOGIN]  Request: username="${req.body.username}" password="${req.body.password}"`);
  if (req.body.username in users) {
    if (req.body.password === users[req.body.username]) {
      const token = auth.create(req.body.username);
      req.session.loggedIn = true;
      req.session.username = req.body.username;
      req.session.time = Date.now();
      req.session.token = token;
      res.redirect("/?" + token);
    } else {
      incorrect = true;
    }
  } else {
    incorrect = true;
  }

  if (incorrect) {
    res.redirect("/login.html?incorrect&username=" + req.body.username);
  }
  next();
});

// Logout
router.get('/logout/:token', async (req, res, next) => {
  if (req.session.loggedIn) {
    console.log(`[LOGOUT]  username="${req.session.username}"`);
    req.session.loggedIn = false;
    delete req.session.username;
    delete req.session.time;
    delete req.session.token;
    if (req.params.token) auth.remove(req.params.token);
  }
  res.redirect("/login.html?logout");
});

module.exports = router;