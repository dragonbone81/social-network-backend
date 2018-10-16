const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pg = require('./database/database_queries');
const app = express();
const port = process.env.PORT || 3000;


app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/users', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const user = req.body.user;
    const db_res = await pg.create_user(user);
    if (db_res.error) {
        res.status(400);
        res.send(db_res);
    } else {
        res.send({success: 'user_created'})
    }
});

app.get('/', async (req, res) => {
    res.send("hello");
});

app.listen(port, () => console.log("Server Started!"));