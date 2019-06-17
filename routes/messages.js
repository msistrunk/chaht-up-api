var express = require('express');
var router = express.Router();
let Message = require('../models/message');
require('dotenv').config()

var mongoose = require("mongoose");
mongoose.connect(process.env.DB, {useNewUrlParser: true});

/* POST messages. */
router.post('/', function(req, res) {
  var newMessage = new Message(req.body);
  newMessage.timestamp = Date.now();
  newMessage.save()
  .then(item => {
    req.app.io.emit('chat message', item);
    res.send("Message saved");
  })
  .catch(err => {
    res.status(400).send("unable to save to database");
  })
});

router.get('/', function(req, res) {
  Message.find({}, (err, messages) => {
    res.json(messages)
  })
})

router.get('/clear', function(req, res) {
  Message.deleteMany({}, (err) => {
    res.json(err)
  })
})

module.exports = router;
