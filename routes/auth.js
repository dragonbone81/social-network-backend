const express = require('express');
const pg = require('../database/database_queries');
const auth = require('../auth/auth');
const router = express.Router();

router.post('/auth/register', async (req, res) => {
    const user = req.body.user;
    if (!user || !('username' in user) || !('password' in user) || !('firstname' in user)
        || !('lastname' in user) || !('email' in user)) {
        res.status(400);
        res.json({error: 'invalid register request'});
        return;
    }
    user.password = await auth.hashPassword(user.password);
    const db_res = await pg.create_user(user);
    if (db_res.error) {
        res.status(400);
        res.json(db_res);
    } else {
        const token = auth.signJWT(user.username);
        const responseUser = {
            token,
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
        };
        res.json({success: 'user_created', user: responseUser})
    }
});
router.post('/auth/token', async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        res.status(400);
        res.json({error: 'invalid token request'});
        return;
    }
    const dbLookupUser = await pg.get_user_with_password(username);
    if (dbLookupUser.error) {
        res.status(400);
        res.json(dbLookupUser.error);
        return;
    }
    if (await auth.comparePassword(password, dbLookupUser.user.password)) {
        const token = auth.signJWT(username);
        const user = {
            token,
            username: dbLookupUser.user.username,
            email: dbLookupUser.user.email,
            firstname: dbLookupUser.user.firstname,
            lastname: dbLookupUser.user.lastname
        };
        res.json({user});
    } else {
        res.status(400);
        res.json({error: 'password incorrect'});
    }
});

module.exports = router;