const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const usersRouter = require('./routes/users');
const chatRouter = require('./routes/chat');
const messagesRouter = require('./routes/messages');

require('dotenv').config();

const port = process.env.PORT;

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
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: `${__dirname}/../chaht-up/build` });
});

io.on('connection', () => {
  console.log('a user is connected');
});

const server = http.listen(port, () => {
  console.log('server is running on port', server.address().port);
});
