
let user;
// need to have a function to return a create account
const box = document.getElementById("mainBox");
const btn = document.getElementById("userLogButtonBox");
const title = document.getElementById("logTitle");
const promt = document.getElementById("promt");
function getCreateAccPage(){
    btn.innerHTML = `<button onclick="addUser();" id="userAddButton">Create Account</button>`;
    title.innerHTML = `Create Account`
    promt.innerHTML = `<span id="promt">Already got an account?<button onclick="getCreateLogPage()" id="createAcc">Log in</button></span>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";

    
}

function getCreateLogPage(){
    btn.innerHTML = `<button onclick="loginUser();" id="userLogButton">Log In</button>`;
    title.innerHTML = `Log In`
    promt.innerHTML = `<span id="promt">Do not have an account?<button onclick="getCreateAccPage()" id="createAcc">Sign Up</button></span>`;
    document.getElementById("user").value = "";
    document.getElementById("password").value = "";
}

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

function returnUser(){
  let user = localStorage.getItem("user");
  let message = `Welcome ${user}! What would you like to do?`;
  let greetingBox = document.getElementById("userGreetings");
  let messageParagraph = greetingBox.querySelector("h3");
  messageParagraph.textContent= message;
}
