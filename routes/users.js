const express = require('express');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const User = require('../models/user');

const router = express.Router();
const saltRounds = 10;
require('dotenv').config();

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
});

/* POST api/user/register */
router.post('/register', (req, res) => {
  const { username } = req.body;
  User.find({ username }, (err, user) => {
    if (user.length) {
      res.send({
        error: 'user already created',
      });
    } else {
      bcrypt.hash(req.body.password, saltRounds, (error, hash) => {
        const newUser = new User({
          username,
          password: hash,
          id: uuidv4(),
        });
        // Store hash in your password DB.
        newUser.save()
          .then(() => {
            res.send('new user created');
          })
          .catch(() => {
            res.status(400).send('unable to register');
          });
      });
    }
  });
});

/* @todo: make this return a token or something for better authentication */
/* POST api/user/login */
router.post('/login', (req, res) => {
  User.find({
    username: req.body.username,
  }, (err, user) => {
    if (user.length) {
      bcrypt.compare(req.body.password, user[0].password, (error, authenticated) => {
        if (authenticated) {
          req.session.userId = user[0].id;
          req.session.username = user[0].username;
          res.send({
            authenticated: true,
          });
        } else {
          res.send({
            authenticated: false,
          });
        }
      });
    } else {
      res.send({
        authenticated: false,
      });
    }
  });
});

module.exports = router;
