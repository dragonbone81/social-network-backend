const express = require('express');
const pg = require('../database/database_queries');
const router = express.Router();
const checkJWT = require('../middleware/checkJWT');

router.get('/user/info', checkJWT, async (req, res) => {
    const dbLookupUser = await pg.get_user(req.username);
    if (dbLookupUser.success) {
        res.json(dbLookupUser.user);
    } else {
        res.status(400);
        res.json(dbLookupUser);
    }
});

// router.get('/users', async (req, res) => {
//     res.send(await pg.get_users(req.query))
// });

router.get('/users', checkJWT, async (req, res) => {
    if (!req.query.queryItem) {
        res.json({error: 'query not provided'})
    }
    res.json(await pg.get_users(req.query.queryItem))
});

module.exports = router;