const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pg = require('./database/database_queries');
const auth = require('./auth/auth');
const app = express();
const port = process.env.PORT || 3000;


app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.post('/auth/register', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const user = req.body.user;
    if (!('username' in user) || !('password' in user) || !('firstname' in user)
        || !('lastname' in user) || !('email' in user)) {
        res.status(400);
        res.send({error: 'invalid register request'});
        return;
    }
    user.password = await auth.hashPassword(user.password);
    const db_res = await pg.create_user(user);
    if (db_res.error) {
        res.status(400);
        res.send(db_res);
    } else {
        const token = auth.signJWT(user.username);
        res.send({success: 'user_created', token: token})
    }
});
app.post('/auth/token', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const {username, password} = req.body;
    if (!username || !password) {
        res.status(400);
        res.send({error: 'invalid token request'});
        return;
    }
    const dbLookupUser = await pg.get_user_password(username);
    if (dbLookupUser.error) {
        res.status(400);
        res.send(dbLookupUser.error);
        return;
    }
    if (await auth.comparePassword(password, dbLookupUser.password)) {
        const token = auth.signJWT(username);
        res.send({token});
    } else {
        res.status(400);
        res.send({error: 'password incorrect'});
    }
});
app.post('/auth/info', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const {token} = req.body;
    if (!token) {
        res.status(400);
        res.send({error: 'invalid token request'});
        return;
    }
    const verifiedJWT = auth.verifyJWT(token);
    if (verifiedJWT.success) {
        const dbLookupUser = await pg.get_user(verifiedJWT.username);
        if (dbLookupUser.success) {
            res.send(dbLookupUser.user);
        } else {
            res.status(400);
            res.send(dbLookupUser);
        }
    } else {
        res.status(400);
        res.send({error: 'invalid token'});
    }
});

app.get('/users', async (req, res) => {
    res.send(await pg.get_users(req.query))
});

app.get('/', async (req, res) => {
    pg.create_user_table();
    res.send("hello");
});

app.listen(port, () => console.log("Server Started!"));