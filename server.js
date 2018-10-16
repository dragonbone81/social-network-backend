const express = require('express');
const morgan = require('morgan');
const mysql = require('mysql');
// const connection = mysql.createConnection({
//     host     : 'localhost',
//     user     : 'me',
//     password : 'secret',
//     database : 'my_db'
// });
const app = express();
const port = process.env.PORT || 3000;


app.use(morgan('short'));

app.get('/', (req, res) => {
    res.send("HELLO");
});

app.listen(port, () => console.log("Server Started!"));