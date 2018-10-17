const express = require('express');
const pg = require('../database/database_queries');
const auth = require('../auth/auth');
const router = express.Router();

router.post('/auth/register', async (req, res) => {
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
router.post('/auth/token', async (req, res) => {
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

module.exports = router;