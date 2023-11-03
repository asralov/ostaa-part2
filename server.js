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
const app = express();
const port = 80;

// Seeting up the database using mongoose and mongoDB
const db  = mongoose.connection;
const mongoDBURL = 'mongodb://127.0.0.1/ostaaItems';
mongoose.connect(mongoDBURL, { useNewUrlParser: true });
db.on('error', () => { console.log('MongoDB connection error:') });

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
app.post('/add/user', (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let p = User.find({username: username}).exec()
  p.then((result) => {
    // Checks if the user already exists
    if (result.length != 0) {
      res.end(JSON.stringify("USER ALREADY EXISTS"));
    } else {
      let user = new User({username: username, password: password, listings: [], purchases: []});
      user.save();
      res.end('USER SUCCESSFULLY SAVED');
    }
  }).catch((err) => {
    res.end("USER SAVE ERROR");
  })
  
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