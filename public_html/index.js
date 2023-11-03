
isLoginPage = true;

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
  let us = document.getElementById('user').value;
  let pw = document.getElementById('password').value;
  console.log(us, pw);
}
function addUser() {
  let us = document.getElementById('user').value;
  let pw = document.getElementById('password').value;
  console.log(us, pw);
  let p = fetch('/add/user/'+us+"/"+encodeURIComponent(pw));
  p.then((response) => {
    return response.text();
  }).then((text) => { 
    document.getElementById("createMessage").innerText = text;
    if (text == "USER ALREADY EXISTS") {
      document.getElementById("createMessage").style.color = "Red";
    } else if (text == "USER SUCCESSFULLY SAVED") {
      document.getElementById("createMessage").style.color = "Green";
      setInterval(getCreateLogPage, 3000);
    }
  }).catch((err) => {
    console.log("yiker" + err);
  });
}
