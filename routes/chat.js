const express = require('express');
const pg = require('../database/database_queries');
const router = express.Router();
const checkJWT = require('../middleware/checkJWT');

//get a users chats
router.get('/chats/user', checkJWT, async (req, res) => {
    const dbLookupChats = await pg.get_chats_for_user(req.username);
    if (dbLookupChats.success) {
        res.json(dbLookupChats.chats);
    } else {
        res.status(400);
        res.json(dbLookupChats);
    }
});

//gets the messages of a chat (chat_id)
router.get('/chats/messages/:chat_id', checkJWT, async (req, res) => {
    const dbLookupMessages = await pg.get_messages_for_chat(req.params.chat_id, req.username);
    if (dbLookupMessages.success) {
        res.json(dbLookupMessages.messages);
    } else {
        res.status(400);
        res.json(dbLookupMessages);
    }
});

//adds a message to a chat
router.post('/chats/message/:chat_id', checkJWT, async (req, res) => {
    const dbMessagePost = await pg.create_message(req.params.chat_id, req.username, req.body.text);
    if (dbMessagePost.success) {
        res.json(dbMessagePost.message_id);
    } else {
        res.status(400);
        res.json(dbMessagePost);
    }
});

//gets the users in a chat
router.get('/chats/users/:chat_id', checkJWT, async (req, res) => {
    const dbLookupUsers = await pg.get_users_in_chat(req.params.chat_id, req.username);
    if (dbLookupUsers.success) {
        res.json(dbLookupUsers.users);
    } else {
        res.status(400);
        res.json(dbLookupUsers);
    }
});

//creates a new chat with the name and users
router.post('/chats/new', checkJWT, async (req, res) => {
    if (!req.body.chat_name || !req.body.chat_users) {
        res.status(400);
        res.json({error: 'invalid chat request'});
        return;
    }
    if (!req.body.chat_users.includes(req.username)) {
        req.body.chat_users.push(req.username);
    }
    await pg.create_transaction();
    const dbCreateChat = await pg.create_chat(req.body.chat_name);
    if (dbCreateChat.success) {
        const promises = [];
        req.body.chat_users.forEach((username) => {
            promises.push(pg.add_user_to_chat(username, dbCreateChat.chat_id));
        });
        try {
            await Promise.all(promises);
            await pg.commit_transaction();
            res.json({success: 'chat_created', chat_id: dbCreateChat.chat_id});
        } catch (err) {
            await pg.rollback_transaction();
            res.json({error: 'one of the users does not exist chat not created'});
        }
    } else {
        await pg.rollback_transaction();
        res.json({error: 'chat_not_created'});
    }
});

module.exports = router;