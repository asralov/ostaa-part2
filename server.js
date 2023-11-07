/**
 * Author: Abrorjon Asralov, Pulat Uralov
 * Class: CSC337
 * Purpose: This JS file is to hold the server side of the website
 * and it uses express, promises, mongoose to create the server side
 * and DB side using MongoDB
 */
// Initializing required modules: mongoose, express, body-express,
// and also initializing the port 80
const mongoose = require('mongoose');
const bp = require('body-parser')
const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const port = 80;

// Seeting up the database using mongoose and mongoDB
const db  = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaaItems';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', () => { console.log('MongoDB connection error:') });

// -----------------Sessions Section----------------- //
let sessions = {};

function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = {id: sid, time: now};
  return sid;
}

function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    //if (last + 120000 < now) {
    if (last + 10000 * 5 < now) {
      delete sessions[usernames[i]];
    }
  }
  console.log(sessions);
}

setInterval(removeSessions, 2000);


app.use(cookieParser());    
app.use(express.json());

function authenticate(req, res, next) {
  let c = req.cookies;
  console.log('auth request:');
  console.log(req.cookies);
  if (c && c.login) {
    console.log(c);
    if (sessions[c.login.username] != undefined && 
      sessions[c.login.username].id == c.login.sessionID) {
      next();
    } else {
      res.redirect('/index.html');
    }
  }  else {
    res.redirect('/index.html');
  }
}


app.use('/app/*', authenticate);

// Load public_html using express
app.use(express.static('public_html'));

// -----------------Schema Section----------------- //
var Schema = mongoose.Schema;

// Creating a new schema for users
var userSchema = new Schema({
  username: String,
  password: String,
  listings: Array,
  purchases: Array,
});
var User = mongoose.model('User', userSchema );   

// Creating a new schema for items
var itemSchema = new Schema({
  title: String,
  description: String,
  image: String,
  price: Number,
  stat: String,
  user: String
});
var Item = mongoose.model('Item', itemSchema);

// Using json 
app.use(bp.json());
// ----------------------------REQUEST SECTION----------------------------//
// POST method. Adds a new user with username and password and adds to the database
app.get('/add/user/:user/:pass', (req, res) => { 
  let username = req.params.user;
  let password = req.params.pass;
  let p = User.find({username: username}).exec()
  p.then((result) => {
    // Checks if the user already exists
    if (result.length != 0) {
      res.end(("USER ALREADY EXISTS"));
    } else {
      let user = new User({username: username, password: password, listings: [], purchases: []});
      user.save();
      res.end('USER SUCCESSFULLY SAVED');
    }
  }).catch((err) => {
    res.end("USER SAVE ERROR");
  })
  
});
app.post('/account/login', (req, res) => { 
  let u = req.body;
  let p1 = User.find({username: u.username, password: u.password}).exec();
  p1.then( (results) => { 
    if (results.length == 0) {
      res.end('Coult not find account');
    } else {
      let sid = addSession(u.username);  
      res.cookie("login", 
        {username: u.username, sessionID: sid}, 
        {maxAge: 60000 * 2 });
      res.end('SUCCESS');
    }
  });
});

// POST method. Adds a new item to the databse
app.post('/add/item', (req, res) => {
  let title = req.body.title;
  let desc = req.body.desc;
  let image = req.body.image;
  let price = req.body.price; 
  let status = req.body.status;
  let userItem = req.body.userItem;

  // return the list of all users containing the user in the request
  let p = User.find({username: userItem}).exec();
  p.then((contents) => {
    // checks if the username exists in the database
    if (contents.length != 0) {
      let item = new Item({title: title, description: desc, image: image, price: price, status: status, user: userItem});
      item.save()
      // Pushes the item to the listings array
      .then((savedItem) => {
        contents[0].listings.push(savedItem);
        contents[0].save();
      })
      res.end("ITEM SUCCESSFULLY SAVED");
    } else {
      res.end("USER DOES NOT EXIST")
    }
  }).catch((err) => {
    res.end("ITEM SAVE ERROR")
  })
});



// GET method. Returns the json file containing all the users
app.get('/get/users', function (req, res) {
  let p = User.find({}).exec();
  p.then((documents) => {
    res.end(JSON.stringify(documents, null, 2));
  });
});

// GET method. Returns the json file containing all the items
app.get('/get/items', function (req, res) {
  let p = Item.find({}).exec();
  p.then((documents) => {
    res.end(JSON.stringify(documents, null, 2));
  });
});

// GET method. Returns the json file containing all users whose username has the substring keyword
app.get('/search/users/:keyword', function (req, res) {
  let p = User.find({ username : { $regex : req.params.keyword } }).exec();
  p.then((documents) => {
    res.end(JSON.stringify(documents, null, 2));
  });
});

// GET method. Returns the json file containing all items whose description has the substring keyword
app.get('/search/items/:keyword', function (req, res) {
  let p = Item.find({ description : { $regex : req.params.keyword } }).exec();
  p.then((documents) => {
    res.end(JSON.stringify(documents, null, 2));
  });
});
// Gets a json file containing all listings of the username
app.get('/get/listings/:username', function (req, res) {
  let p = User.find({username: req.params.username}).exec();
  p.then((documents) => {
    if (documents.length != 0) {
      let p1 = documents[0].listings
      res.end(JSON.stringify(p1, null, 2));
    } else {
      res.end("USER DOES NOT EXIST")
    }
  }).catch((err) => {
    res.end('DATABSE ERROR');
  })
})
// Gets a json file containing all purchases of the username
app.get('/get/purchases/:username', function (req, res) {
  let p = User.find({username: req.params.username}).exec();
  p.then((documents) => {
    if (documents.length != 0) {
      let p1 = documents[0].purchases
      res.end(JSON.stringify(p1, null, 2));
    } else {
      res.end("USER DOES NOT EXIST")
    }
  }).catch((err) => {
    res.end('DATABSE ERROR');
  })
})

// Listening to the port 80
app.listen(port, ()=>{console.log(`Success!!!`)});