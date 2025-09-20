const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/session_auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(session({
  secret: 'badsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/session_auth' }),
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});
