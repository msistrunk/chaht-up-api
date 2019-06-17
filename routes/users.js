const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const uuidv4 = require('uuid/v4');
const User = require('../models/user');
require('dotenv').config()

const mongoose = require("mongoose");
mongoose.connect(process.env.DB, {useNewUrlParser: true});

/* POST api/user/register */
router.post('/register', function(req, res) {
  const { username } = req.body;
  User.find({username}, (err, user) => {
    if(user.length){
      res.send({error: 'user already created'});
    }
    else{
      bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        let newUser = new User({username, password: hash, id: uuidv4()})
        // Store hash in your password DB.
        newUser.save()
        .then(item => {
          res.send("new user created");
        })
        .catch(err => {
          res.status(400).send("unable to register");
        })
      });
    }
  })  
});

/*@todo: make this return a token or something for better authentication*/
/* POST api/user/login */
router.post('/login', function(req, res) {
  User.find({username: req.body.username}, (err, user) => {
    if(user.length){
      bcrypt.compare(req.body.password, user[0].password, function(err, authenticated) {
        if(authenticated){ 
          res.send({authenticated: true});
        } else { 
          res.send({authenticated: false}); 
        }
      });
    } else {
      res.send({authenticated: false});
    }
  })
});

module.exports = router;
