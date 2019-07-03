const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
require('dotenv').config();

const app = express();
const server = app.listen(process.env.ROUTE || 3000);
const io = require('socket.io').listen(server); // this tells socket.io to use our express

const usersRouter = require('./routes/users');
const chatRouter = require('./routes/chat');
const messagesRouter = require('./routes/messages');
const passwordRouter = require('./routes/password');


mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
});

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
app.use(
  session({
    key: 'user_sid',
    store: new MongoStore({ url: process.env.DB }),
    secret: 'dreamteam',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  }),
);

app.use('/chat', chatRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);
app.use('/api/password', passwordRouter);
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: `${__dirname}/../chaht-up/build` });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.sockets.on('connection', socket => {
  socket.on('chat message', msg => {
    io.emit('chat message', msg);
  });
});

module.exports = app;
