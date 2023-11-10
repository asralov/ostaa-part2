/**
 * Class: CS 337
 * Author: Pulat Uralov and Abrorjon Asralov
 * Description: This file controls user side
 */

// need to have a function to return a create account
const box = document.getElementById("mainBox");
const btn = document.getElementById("userLogButtonBox");
const title = document.getElementById("logTitle");
const promt = document.getElementById("promt");

/**
 * This function changes the HTML for creating a new user.
 * Gets called when a user presses "Do not have an account?" button
 */
function getCreateAccPage(){
    btn.innerHTML = `<button onclick="addUser();" id="userAddButton">Create Account</button>`;
    title.innerHTML = `Create Account`
    promt.innerHTML = `<span id="promt">Already got an account?<button onclick="getCreateLogPage()" id="createAcc">Log in</button></span>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";    
}
/**
 * This function changes the HTML for logging an existing user.
 * Gets called when a user presses the "Already got an account"? button
 */
function getCreateLogPage(){
    btn.innerHTML = `<button onclick="loginUser();" id="userLogButton">Log In</button>`;
    title.innerHTML = `Log In`
    promt.innerHTML = `<span id="promt">Do not have an account?<button onclick="getCreateAccPage()" id="createAcc">Sign Up</button></span>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
}

/**
 * This function get called whenever a user presses the log in button.
 * Sends POST request to the server. If successful, sends the user to 
 * the homepage
 */
function loginUser() {
  console.log('yes');
  let us = document.getElementById('user').value;
  localStorage.setItem("user", us)
  let pw = document.getElementById('password').value;
  let data = {username: us, password: pw};
  let p = fetch( '/account/login/', {
    method: 'POST', 
    body: JSON.stringify(data),
    headers: {"Content-Type": "application/json"}
  });
  p.then((response) => {
    return response.text();
  }).then((text) => {
    console.log(text);
    if (text.startsWith('SUCCESS')) {
      alert(text);
      window.location.href = '/app/home.html';
    } else {
      alert('FAILED');
    }
  });
}
/**
 * This function adds a user to the database. If the username already exists
 * the function does not save to the database and notifies the user that the 
 * username has been taken
 */
function addUser() {
  let us = document.getElementById('user').value;
  let pw = document.getElementById('password').value;
  console.log(us, pw);
  // Encodes the password for protection
  let p = fetch('/add/user/'+us+"/"+encodeURIComponent(pw));
  p.then((response) => {
    return response.text();
  }).then((text) => { 
    // Shows the user the status message
    document.getElementById("createMessage").innerText = text;
    // message element changes color depending on the message
    if (text == "USER ALREADY EXISTS" || text == "USER SAVE ERROR") {
      document.getElementById("createMessage").style.color = "Red";
    } else if (text == "USER SUCCESSFULLY SAVED") {
      document.getElementById("createMessage").style.color = "Green";
      //setInterval(getCreateLogPage, 3000);
    }
  }).catch((err) => {
    console.log("yiker" + err);
  });
}


/*----------------Main Page Section------------- */
window.onload = returnUser;

/**
 * this function displays the welcome text with the user's
 * username
 */
function returnUser(){
  let user = localStorage.getItem("user");
  let message = `Welcome ${user}! What would you like to do?`;
  let greetingBox = document.getElementById("userGreetings");
  let messageParagraph = greetingBox.querySelector("h3");
  messageParagraph.textContent= message;
}

const redirectBtn = document.getElementById("postItem");
redirectBtn.addEventListener('click', ()=> {
  window.location.href = '/app/post.html';
})
/**
 * this function gets called whenever a user searches for a listing
 * Sends a GET request to the server and gets all listgins with the given
 * keyword
 */
function viewListings() {
  let item = document.getElementById("item").value;
  let p = fetch('/search/items/'+item);
  p.then((response) => {
    return response.json();
  }).then((text) => {
    showListings(text);
  })
}
/**
 * This function gets called whenever the user views all of their 
 * listings. Sends a get request to the server and calls a helper function
 * that shows all of the listing
 */
function viewListingsOfAUser() {
  let user = localStorage.getItem("user");
  let p = fetch('/get/listings/' + user);
  p.then((response) => {
    return response.json();
  }).then((text) => {
    showListings(text);
  })
}
/**
 * This function gets called whenver the user views all of their
 * purchases.Sends a get request to the server and calls a helper function
 * that shows all of the listing
 */
function viewPurchasesOfAUser() {
  let user = localStorage.getItem("user");
  let p = fetch('/get/purchases/' + user);
  p.then((response) => {
    return response.json();
  }).then((text) => {
    showListings(text);
  })
}

/**
 * 
 * @param {*} text text is the list of all listings/purchases
 * This is a helper function that gets called inside viewListingsOfAUser()
 * and viewPurchasesOfAUser(). Creates an HTML block and shows it to the user
 */
function showListings(text) {
  console.log("hey");
  let user = localStorage.getItem("user");
  let listings = ""   //'<p>' + text[i].image + '</p>' +
    for (let i = 0; i < text.length; i++) {
      let itemID = text[i]._id;
      console.log(text[i].image);
      let listing = `<div class="listingBox">
                      <h1>${text[i].title}</h1>
                      <img class="itemImg" src="${text[i].image}">
                      <p>${text[i].description}</p>
                      <p>$${text[i].price}</p>`
      if (text[i].stat == "SALE" && text[i].user != user) {
        listing += '<button id="'+ itemID +'"class="buyBtn" onclick="purchaseListing(\''+itemID+'\');">Buy Now!</button>' +  '</div>'
      } else if (text[i].stat == "SOLD") {
        listing += '<p>Sold!</p>' + '</div>'
      }
      listings += listing;
    }
    document.getElementById("itemSection").innerHTML = listings;
}
/**
 * 
 * @param {*} itemID is the id of an item
 * This function gets called whenever the user presses the Buy now button.
 * Sends a GET request to the database and refereshes the listings after the purchase
 */
function purchaseListing(itemID) {
  let user = localStorage.getItem("user");
  let p = fetch('/purchase/listing/'+user+'/'+itemID);
  p.then((response) => {
    return response.text();
  }).then((text) => {
    window.alert(text);
    viewListings();
  })
}


/*----------------post Section------------- */
/**
 * This function gets called when a user presses the "Add item" button.
 * Sends a POST request to the server which saves the listing. Redirects the
 * user back to the home page
 */
function createListing() {
  var title = document.getElementById("itemTitle").value;
  var desc = document.getElementById("descItem").value;
  var price = document.getElementById("priceItem").value;
  var imgs = document.getElementById("imageItem");
  var img = imgs.files[0];
  var userItem = localStorage.getItem("user");

  // Alert the user if any of the entries is blank
  if (title == "" || desc == "" || price == "" || userItem == "" || img == "") {
    window.alert("Please fill out all the information");
  } else {
    let formData = new FormData();
    formData.append("title", title);
    formData.append("desc", desc);
    formData.append("price", price);
    formData.append("userItem", userItem);
    formData.append("image", img);

    // send to the server using POST method
    let p = fetch('/add/item', {
      method: 'POST',
      body: formData,
    });

    p.then((response) => {
      return response.text();
    }).then((text) => {
      window.alert(text);
      window.location.href = '/app/home.html';
    }).catch((err) => {
      console.log(err);
    });
  }
}
