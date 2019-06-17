var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var chatRouter = require('./routes/chat');
var messagesRouter = require('./routes/messages');

var app = express();
var server = app.listen(3001);
var io = require('socket.io').listen(server); // this tells socket.io to use our express 
app.io = io;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(`${__dirname}/../chaht-up/build`));
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: `${__dirname}/../chaht-up/build` });
});

app.use('/chat', chatRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.sockets.on('connection', function (socket) {
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

module.exports = app;
