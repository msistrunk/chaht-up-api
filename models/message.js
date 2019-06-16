let mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
  author: String,
  message: String,
  timestamp: Date
 });

 module.exports = mongoose.model('Message', messageSchema);