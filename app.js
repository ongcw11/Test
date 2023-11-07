// app.js
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

// Set up session and Passport
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Connect to a MongoDB database
mongoose.connect('mongodb://localhost/memberApp', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a User model
const User = require('./models/user');

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Define a Member model (adjust schema accordingly)
const Member = require('./models/member');

// Login route
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
}));

// Admin registration route (simplified; in a real application, use a more secure method)
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  User.register(new User({ username: username }), password, (err, user) => {
    if (err) {
      console.log(err);
      return res.redirect('/register');
    }
    passport.authenticate('local')(req, res, () => {
      res.redirect('/dashboard');
    });
  });
});

// Member creation route (simplified; use proper validation)
app.get('/create-member', (req, res) => {
  res.render('create-member');
});

app.post('/create-member', (req, res) => {
  const name = req.body.name;
  const birthdate = req.body.birthdate;
  const address = req.body.address;

  // Save member details to the database (adjust schema accordingly)
  const newMember = new Member({ name, birthdate, address });
  newMember.save((err) => {
    if (err) {
      console.log(err);
      return res.redirect('/create-member');
    }
    res.redirect('/dashboard');
  });
});

// Export member details to PDF
app.get('/export-pdf', (req, res) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream('member_details.pdf'));

  // Fetch member details from the database and add them to the PDF
  Member.find({}, (err, members) => {
    if (err) {
      console.log(err);
      return res.status(500).send('Error fetching members');
    }

    members.forEach((member) => {
      doc.text(`Name: ${member.name}`);
      doc.text(`Birthdate: ${member.birthdate}`);
      doc.text(`Address: ${member.address}`);
      doc.moveDown();
    });

    doc.end();
    res.send('PDF generated successfully');
  });
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
