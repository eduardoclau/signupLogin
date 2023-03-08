const express = require('express');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const nodemailer = require('nodemailer');
const passportLocal = require('passport-local');
const bcrypt = require('bcryptjs');
const app = express();
const LocalStrategy = require('passport-local').Strategy;




//DB Config

const db = require('./config/keys').MongoURI;


const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));



//EJS
app.set('view engine', 'ejs');
app.use(expressLayouts);




//BodyParser
app.use(express.urlencoded({ extended: false }));

//Express-Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));




//Passport config
require('./config/passport')(passport);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());



//Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'))




//connect to dataBase
//Connect to Mongo
mongoose.set('strictQuery', true);
mongoose.connect(db, { useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));