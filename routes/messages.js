const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/message');
require('dotenv').config();

const router = express.Router();
mongoose.connect(process.env.DB, { useNewUrlParser: true });

/* POST messages. */
router.post('/', (req, res) => {
  if (!req.session.username) {
    res.status(401).send('unathorized');
  } else {
    const newMessage = new Message(req.body);
    newMessage.timestamp = Date.now();
    newMessage.save()
      .then((item) => {
        req.app.io.emit('chat message', item);
        res.send('Message saved');
      })
      .catch(() => {
        res.status(400).send('unable to save to database');
      });
  }
});

router.get('/', (req, res) => {
  if (!req.session.username) {
    res.status(401).send('unathorized');
  } else {
    Message.find({}, (err, messages) => {
      res.json(messages);
    });
  }
});

router.get('/clear', (req, res) => {
  if (!req.session.username) {
    res.status(401).send('unathorized');
  } else {
    Message.deleteMany({}, (err) => {
      res.json(err);
    });
  }
});

module.exports = router;
