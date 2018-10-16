const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pg = require('./database/database_queries');
const app = express();
const port = process.env.PORT || 3000;


app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/auth/register', async (req, res) => {
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

app.post('/auth/register', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const user = req.body.user;
    if (!user) {
        res.send(JSON.stringify({success: false, error: 'User not provided'}));
        return;
    }
    user.password = await auth.hashPassword(user.password);
    try {
        const createdUser = await models.Users.create(user);
        const token = auth.signJWT(createdUser._id);
        res.send(JSON.stringify({success: true, token: token}));
    } catch (e) {
        console.log(e);
        res.send(JSON.stringify({success: false}));
    }
});

app.get('/', async (req, res) => {
    res.send("hello");
});

app.listen(port, () => console.log("Server Started!"));