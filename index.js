const express = require('express');
const app = express();
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const mysql = require('mysql');
const cors = require('cors');
const flash = require('connect-flash');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
const PORT = process.env.port || 3000

const db  = mysql.createPool({
  host : 'localhost',
  user : 'root',
  password : 'password',
  database : 'Patient_DB'
});

// EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//middleware
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Connect flash
app.use(flash());

//Global variables
app.use(function(req, res, next) {
  res.locals.messages = req.flash();
  next();
});

app.get('/', (req, res) => {
  res.render('appointment', {message:req.flash('message')});
})

app.post('/insert/patient',
  body('firstName')
    .notEmpty()
    .withMessage('First Name cannot be empty'),
    body('lastName')
    .notEmpty()
    .withMessage('Last Name cannot be empty'),
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone Number cannot be empty'),
  body('email')
    .notEmpty()
    .withMessage('Email cannot be empty')
    .isEmail()
    .withMessage('Email Invalid'),
  body('gender')
    .notEmpty()
    .withMessage('Gender cannot be empty'),
  body('meetingTime')
    .notEmpty()
    .withMessage('Appointment Date and Time cannot be empty cannot be empty'),
  body('age')
    .notEmpty()
    .withMessage('Age cannot be empty cannot be empty'),
  (req, res) => {
  let { firstName, lastName, phoneNumber, email, gender, age, meetingTime } = req.body;
  let meetingTimeInMysqlFormat;
  let dateTime;
  let fullName;
  const errors = validationResult(req);
  const alerts = errors.array({ onlyFirstError: true });
  console.log(alerts.length)

  console.log(req.body)
  console.log(errors.array())
  console.log('Errors',alerts);
  if(alerts.length > 0){
    if(alerts.length == 6){
      req.flash('error','Please Enter All The Input Fields')
      res.redirect('/#firstName')
    } else {
      req.flash('alerts',alerts);
      res.redirect(`/#${alerts[0].param}`)
    }
  } else {

    if(meetingTime) { 
      meetingTime = meetingTime+':00';
      dateTime = new Date(meetingTime);
      meetingTimeInMysqlFormat =  new Date(dateTime.getTime() - (dateTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace('T', ' ');
    }
  
    if(firstName && lastName) {
      fullName = `${firstName} ${lastName}`;
    }

    const sqlInsert = "INSERT INTO patient_tbl (first_name, last_name, gender, age, full_name, mobile_no, email_address, crt_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(sqlInsert,[firstName,lastName, gender, age, fullName, phoneNumber, email, meetingTimeInMysqlFormat], (err, result) => {
      console.log(result);
      console.log(err);
    })
    req.flash('success','Appointment Success');
    res.redirect('/');

  }

  // if(!phoneNumber || !email || !gender || !age || !firstName || !lastName || !meetingTime) {
  //   req.flash('error','Please Enter All The Input Fields');
  //   res.redirect('/');
  // } else { 
  //   const sqlInsert = "INSERT INTO patient_tbl (first_name, last_name, gender, age, full_name, mobile_no, email_address, crt_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

  //   // db.query(sqlInsert,[firstName,lastName, gender, age, fullName, phoneNumber, email, meetingTimeInMysqlFormat], (err, result) => {
  //   //   console.log(result);
  //   //   console.log(err);
  //   // })
  //   req.flash('success','Appointment Success');
  //   res.redirect('/');
  // }
})

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})