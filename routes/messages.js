var express = require('express');
var router = express.Router();
require('dotenv').config()

var mongoose = require("mongoose");
mongoose.connect(process.env.DB, {useNewUrlParser: true});

var messageSchema = new mongoose.Schema({
  author: String,
  message: String
 });
 var Message = mongoose.model("Message", messageSchema);

/* POST messages. */
router.post('/', function(req, res) {
  var myMessage = new Message(req.body);
  console.log(req.body);
  myMessage.save()
  .then(item => {
    req.app.io.emit('chat message', item.message);
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