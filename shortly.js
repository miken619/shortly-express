const express = require('express');
const util = require('./lib/utility');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt-nodejs');

const db = require('./app/config');
const Users = require('./app/collections/users');
const User = require('./app/models/user');
const Links = require('./app/collections/links');
const Link = require('./app/models/link');
const Click = require('./app/models/click');
const session = require('express-session');
const sessionsdb = require('./app/models/sessions');
const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)

//app.use(cors());
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(
  session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: true, authorized: false})
);

app.get('/', 
function(req, res) {

  if (req.session.authorized) {
    
    res.render('index');
  } else {
    res.render('signup');
  }
  //res.render('signup');
});
app.get('/logout', (req, res) => {
  req.session.authorized = false;
  res.redirect('/');
});
app.get('/create', 
function(req, res) {
  if (req.session.authorized) {
    res.render('index');
  } else {
    res.redirect('/');
  }
});
app.get('/login', (req, res) => res.render('login'));
//app.get('/signup', (req,res) => res.render('login'));

app.get('/links', 
function(req, res) {
  if (req.session.authorized) {
    
    Links.reset().fetch().then(function(links) {
      res.status(200).send(links.models);
    });
  } else {
    res.redirect('/');
  }
});
 
//app.get('/login', (req, res) => res.render('login'));

app.post('/links', 
function(req, res) {
  var uri = req.body.url;
 
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          
          res.status(200).send(newLink);
        });
      });
    }
  });
});
app.post('/signup', function(req, res) {

  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, null, function(err, hash) {
      new User({username: req.body.username, password: hash}).save().then(resp => {
        req.session.username = req.body.username;
        req.session.authorized = true;
        res.render('index');
        
      }).catch(err=>res.redirect('/'));
      //console.log(db.knex('users').where('username', '=', req.body.username).del());
        // Store hash in your password DB.
      
    });
  });


});

app.post('/login', function(req, res) {
  new User({username: req.body.username}).fetch().then(found => {
    if (found) {
      bcrypt.compare(req.body.password, found.attributes.password, (err, result) => {
        if (err || !result) {
          res.render('/');
        } else {
          req.session.username = req.body.username;
          req.session.authorized = true;
          res.render('index');
        }
      });
    } else {
      res.render('/');
    }
  });
});
/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
    
        linkId: link.get('id')
      });
      console.log(click.linkId, 'app.get link id');
      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

module.exports = app;
