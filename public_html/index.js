// need to have a function to return a create account
const box = document.getElementById("mainBox");

function getCreateAccPage(){
    box.innerHTML = `<div id="title">
    <h1>Ostaa</h1>
</div>
<div id="formBox">
    <div id="loginOrCreateTitle">
        <h3>Log In</h3>
        <div id="userBox">
            <div id="userName">
                <span>Username</span>
                <input type="text" id="user">
            </div>
            <div id="userPassword">
                <span>Password</span>
                <input type="password" id="password">
            </div>
            <div id="userAddButtonBox">
                <button onclick="addUser();" id="userAddButton">
                    Add User
                </button>
            </div>
        </div> `
}

