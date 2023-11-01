const express = require('express');
const app = express();
const port = 80;

app.use(express.static('public_html'));
// this is to listen to the server
app.listen(port, ()=>{console.log("Success!")});