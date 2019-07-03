const express = require('express');
const bcrypt = require('bcryptjs');
const uuidv4 = require('uuid/v4');
const User = require('../models/user');
const auth = require('../middlewares/authorized');

const router = express.Router();
const saltRounds = 10;
require('dotenv').config();



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
router.post('/login', (req, res) => {
  const { password, username } = req.body;
  User.find(
    {
      username,
    },
    (err, user) => {
      if (user.length) {
        bcrypt.compare(password, user[0].password, (error, authenticated) => {
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
    },
  );
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
