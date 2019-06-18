const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();
const server = app.listen(3000);
const io = require('socket.io').listen(server); // this tells socket.io to use our express

const usersRouter = require('./routes/users');
const chatRouter = require('./routes/chat');
const messagesRouter = require('./routes/messages');

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
app.use(session({
  key: 'user_sid',
  store: new MongoStore({ url: process.env.DB }),
  secret: 'dreamteam',
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 1800,
  },
}));

// This middleware will check if user's cookie is still saved in browser and user is not set,
// then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still
// remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
    res.clearCookie('user_sid');
  }
  next();
});

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: `${__dirname}/../chaht-up/build` });
});

app.use('/chat', chatRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);

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

io.sockets.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

module.exports = app;
