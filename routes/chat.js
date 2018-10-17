const express = require('express');
const pg = require('../database/database_queries');
const router = express.Router();
const checkJWT = require('../middleware/checkJWT');

router.get('/chat/user', checkJWT, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const dbLookupChats = await pg.get_chats_for_user(req.username);
    if (dbLookupChats.success) {
        res.send(dbLookupChats.chats);
    } else {
        res.status(400);
        res.send(dbLookupChats);
    }
});

module.exports = router;