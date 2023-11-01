const express = require('express');
const app = express();
const port = 80;

app.use(express.static('public_html'));
app.listen(port, ()=>{console.log("Success!")});