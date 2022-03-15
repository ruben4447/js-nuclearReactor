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

// Delete account
router.get('/delete/:token', async (req, res, next) => {
  if (req.session.loggedIn) {
    console.log(`[DELETE]  username="${req.session.username}"`);
    let ok = await data.delUser(req.session.username);
    if (ok) {
      req.session.loggedIn = false;
      delete req.session.username;
      delete req.session.time;
      delete req.session.token;
      if (req.params.token) auth.remove(req.params.token);
    }
  }
  res.redirect("/login.html");
});

// Reset account progress
router.get('/reset/:token', async (req, res, next) => {
  let ok = false;
  if (req.session.loggedIn && auth.exists(req.params.token)) {
    console.log(`[RESET]  username="${req.session.username}"`);
    const userData = data.createNewUserDataObject();
    await data.setUserData(req.session.username, userData);
    ok = true;
  }
  if (ok) {
    res.redirect("/?" + req.params.token);
  } else {
    res.redirect("/login.html");
  }
});

module.exports = router;