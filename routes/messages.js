const express = require('express');
const mongoose = require('mongoose');
const Message = require('../models/message');
const auth = require('../middlewares/authorized');
require('dotenv').config();

const router = express.Router();
mongoose.connect(process.env.DB, { useNewUrlParser: true });

/* POST messages. */
router.post('/', auth, (req, res) => {
  if (!req.session.username) {
    res.status(401).send('unauthorized');
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

router.get('/', auth, (req, res) => {
  if (!req.session.username) {
    res.status(401).send('unauthorized');
  } else {
    Message.find({}, (err, messages) => {
      res.json(messages);
    });
  }
});

router.get('/clear', auth, (req, res) => {
  const sess = req.session;
  if (!sess.username) {
    res.status(401).send('unauthorized');
  } else {
    Message.deleteMany({}, (err) => {
      res.json(err);
    });
  }
});

module.exports = router;
