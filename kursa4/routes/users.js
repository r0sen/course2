var express = require('express');
var router = express.Router();
var passport       = require('passport');
var LocalStrategy  = require('passport-local').Strategy;
//***********************************UPLOAD
var path = require('path');
var multer  = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/pics/avatars/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
});




var avatar = multer({ storage: storage });



router.post('/profile', ensureAuthenticated, avatar.single('avatar'), function (req, res, next) {
  User.getUserById(req.user.id, function(err, myuser) {
    if (err) throw err;
    myuser.avatar = req.file.filename;
    //console.log(myuser.avatar);
    User.updateUser(req.user.id, myuser, {}, function(err, mynewuser){
      if(err) throw err;
      //console.log(mynewuser.avatar);
      res.redirect('/users/profile');
    });
  });
});




function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    req.flash('error_msg', 'You are not logged in');
    res.redirect('/users/login');
  }
}

//**********************************************
router.get('/register', function(req, res, next) {
  res.render('signup');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/profile', ensureAuthenticated, function(req, res, next) {
    res.render('user');
});
router.post('/register', function(req, res) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    console.log("User sent: firstname: "+firstname+"; lastname: "+lastname+"; email: "+email+"; username: "+username+"; password1: "+password+"; password2: "+confirmPassword);

    //validation
    req.checkBody('firstname', 'First name is required').notEmpty();
    req.checkBody('lastname', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email is required').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
      res.render('signup', {errors: errors});
    }else{
      var newUser = new User({
        username: username,
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: password
      });

      User.createUser(newUser, function(err, user){
        if(err) throw err;
        console.log(user);
      });

      req.flash('success_msg', 'You are registred and now can log in');
      res.redirect('login');
    };
});
router.post('/adminmenu', function(req, res) {
console.log("HERE");
    var title = req.body.title;
    var genre = req.body.genre;
    var description = req.body.description;
    var author = req.body.author;
    var publisher = req.body.publisher;
    var pages = req.body.pages;
    var price = req.body.price;
    var release_date = req.body.release_date;
    var age_limit = req.body.age_limit;
    var language = req.body.language;
console.log("HERE");
//console.log("User sent: title: "+title+"; genre: "+genre+"; description: "+description+"; author: "+author+"; publisher: "+publisher+"; password2: "+confirmPassword);
    //validation
    req.checkBody('title', 'title is required').notEmpty();
    req.checkBody('genre', 'genre is required').notEmpty();
    req.checkBody('description', 'description is required').notEmpty();
    req.checkBody('author', 'author is required').notEmpty();
    req.checkBody('publisher', 'publisher is required').notEmpty();
    req.checkBody('pages', 'pages is required').notEmpty();
    req.checkBody('price', 'price is required').notEmpty();
    req.checkBody('release_date', 'release_date is required').notEmpty();
    req.checkBody('age_limit', 'age_limit is required').notEmpty();
    req.checkBody('language', 'language is required').notEmpty();


console.log("HERE");
    var errors = req.validationErrors();
console.log("HERE");
    if(errors){
      res.render('adminmenu', {errors: errors});
    }else{
      var newBook = new Book({
        title: title,
        genre: genre,
        description: description,
        author: author,
        publisher: publisher,
        pages: pages,
        price: price,
        release_date: release_date,
        age_limit: age_limit,
        language: language
      });
console.log("HERE");
      Book.addBook(newBook, function(err, book){
        if(err) throw err;
        console.log(book);
      });

      req.flash('success_msg', 'You are registred and now can log in');
      res.redirect('adminmenu');
    };
});
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.getUserByUsername(username, function(err, user){
      if (err) throw err;
      if(!user){
        return done(null, false, {message: 'Unknown user'});
      }

      User.comparePassword(password, user.password, function(err, isMatch){
          if(err) throw err;
          if(isMatch){
            return done(null, user);
          } else{
            return done(null, false, {message: 'Invalid password'});
          }
      });
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login', failureFlash: true}),
  function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  req.flash('success_msg', "You are logged out");
  res.redirect('/users/login');
});
router.get('/adminmenu', ensureAuthenticated, function(req, res, next) {

//  console.log("HERE");
  //  console.log(req.user);
  if (req.user.admin == true){
//  console.log("HERE2");
    res.render('adminmenu');}

     else res.render('error');

});
module.exports = router;
