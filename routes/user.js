const express = require('express');
const pg = require('../database/database_queries');
const router = express.Router();
const checkJWT = require('../middleware/checkJWT');

router.get('/user/info', checkJWT, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const dbLookupUser = await pg.get_user(req.username);
    if (dbLookupUser.success) {
        res.send(dbLookupUser.user);
    } else {
        res.status(400);
        res.send(dbLookupUser);
    }
});

router.get('/users', async (req, res) => {
    res.send(await pg.get_users(req.query))
});

module.exports = router;