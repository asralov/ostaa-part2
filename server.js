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
// to store pictures and show them to the user by getting their pics uploaded to the server
const multer = require('multer')
const port = 80;

// Add this line to your server setup
app.use('/uploads', express.static('uploads'));


const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    return cb(null, "./uploads")
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({storage})

// Seeting up the database using mongoose and mongoDB
const db  = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaaItems';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', () => { console.log('MongoDB connection error:') });

// -----------------Sessions Section----------------- //
let sessions = {};

// Adds a session when a user logs in
function addSession(username) {
  let sid = Math.floor(Math.random() * 1000000000);
  let now = Date.now();
  sessions[username] = {id: sid, time: now};
  return sid;
}
// get called every 2 seconds. Checks if the session is expired and 
// deletes the session if it is
function removeSessions() {
  let now = Date.now();
  let usernames = Object.keys(sessions);
  for (let i = 0; i < usernames.length; i++) {
    let last = sessions[usernames[i]].time;
    //if (last + 120000 < now) { did 10000, i changed to be 99999
    if (last +60000 * 5 < now) {
      delete sessions[usernames[i]];
    }
  }
  console.log(sessions);
}

setInterval(removeSessions, 2000);


app.use(cookieParser());    
app.use(express.json());

// Gets called every time a user opens a webpage in folder "app"
// checks if the session exists. If not, redirects to log in page
function authenticate(req, res, next) {
  let c = req.cookies;
  console.log('auth request:');
  console.log(req.cookies);
  if (c && c.login) {
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
// POST method. Logs the user into the website.
app.post('/account/login', (req, res) => { 
  let u = req.body;
  // Checks if the user is in the database
  let p1 = User.find({username: u.username, password: u.password}).exec();
  p1.then( (results) => { 
    if (results.length == 0) {
      res.end('Coult not find account');
    } else {
      let sid = addSession(u.username);  
      // Creates a cookie with 
      res.cookie("login", 
        {username: u.username, sessionID: sid}, 
        {maxAge: 60000 * 5 });
      res.end('SUCCESS');
    }
  });
});

// POST method. Adds a new item to the databse
app.post('/add/item', upload.single("image"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
  let title = req.body.title;
  let desc = req.body.desc;
  // let image = req.body.image;
  let price = req.body.price; 
  let userItem = req.body.userItem;
  // return the list of all users containing the user in the request
  let p = User.find({username: userItem}).exec();
  p.then((contents) => {
    // checks if the username exists in the database
    if (contents.length != 0) {
      let item = new Item({title: title, description: desc, image:"/uploads/"+req.file.filename, price: price, stat: "SALE", user: userItem});
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

// GET method. Changes the status of the item to SOLD
// and adds the listing to the user's purchased array
app.get('/purchase/listing/:user/:itemId', (req, res) => {
  var user = req.params.user;
  var itemID = req.params.itemId;
  Item.find({_id: itemID}).exec()
  .then((listings) => {
    // Checks if the listing exists
    if (listings.length != 0) {
      var listing = listings[0]
      User.find({username: user}).exec()
      .then((users) => {
        //Checks if the user exists
        if (users.length != 0) {
          if (listing.stat == "SOLD") {
            res.end("ITEM ALREADY SOLD");
          }
          listing.stat = "SOLD";
          listing.save();
          users[0].purchases.push(listing);
          users[0].save();
          res.end("SOLD!");
        } else {
          res.end("COULD NOT FIND USER");
        }
      });
    } else {
      res.end("COULD NOT FIND LISTING");
    }
  });
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