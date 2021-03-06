const express = require('express');
const bcrypt = require('bcrypt');
const uuidv4 = require('uuid/v4');
const mongoose = require('mongoose');
const User = require('../models/user');
const auth = require('../middlewares/authorized');

const router = express.Router();
const saltRounds = 10;
require('dotenv').config();

mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
});

/* POST api/user/register */
/* eslint-disable-next-line consistent-return */
router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  const newUser = new User({
    email,
    id: uuidv4(),
    username,
  });

  const usernameExists = await User.exists({ username });
  const emailExists = await User.exists({ email });

  const exists = {
    ...(usernameExists && { usernameExists }),
    ...(emailExists && { emailExists }),
  };

  if (Object.keys(exists).length) {
    return res.status(400).send(exists);
  }
  bcrypt.hash(password, saltRounds, async (errors, hash) => {
    newUser.password = hash;
    try {
      await newUser.save();
      res.send({ created: true });
    } catch (saveError) {
      res.status(400).send(saveError);
    }
  });
});

/* POST api/user/login */
router.post('/login', async (req, res) => {
  const { password, username } = req.body;
  try {
    const usernameRegex = new RegExp(`^${username}$`, 'i');
    const user = await User.findOne({ username: usernameRegex });
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new Error('Invalid Login');
    }
    req.session.userId = user.id;
    req.session.username = user.username;
    res.send({
      authenticated: true,
    });
  } catch (error) {
    res.send({
      authenticated: false,
    });
    console.log(error);
  }
});

/* POST api/user/logout */
router.post('/logout', auth, (req, res) => {
  req.session.destroy(err => {
    if (!err) {
      res.send({ logout: true });
    }
    res.send({ logout: false });
  });
});

module.exports = router;
