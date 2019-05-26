var express = require('express');
var router = express.Router();
var path = require('path');
var directory = path.basename(__dirname);

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.sendFile(path.join(__dirname, '..', '/views/chat.html'));
  res.render('chat');
});

module.exports = router;
