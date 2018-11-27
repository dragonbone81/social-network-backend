const express = require('express');
const pg = require('../database/database_queries');
const router = express.Router();
const checkJWT = require('../middleware/checkJWT');

//get a users chats
router.get('/chats/user', checkJWT, async (req, res) => {
    try {
        const dbLookupChats = await pg.get_chats_for_user(req.username);
        res.json(dbLookupChats.chats);
    } catch (err) {
        res.json(err);
    }
});

//gets the messages of a chat (chat_id)
router.get('/chats/messages/:chat_id', checkJWT, async (req, res) => {
    try {
        const dbLookupMessages = await pg.get_messages_for_chat(req.params.chat_id, req.username);
        res.json(dbLookupMessages.messages);
    } catch (err) {
        res.json(err);
    }
});

//adds a message to a chat
router.post('/chats/message/:chat_id', checkJWT, async (req, res) => {
    try {
        const dbMessagePost = await pg.create_message(req.params.chat_id, req.username, req.body.text, req.body.type);
        res.json(dbMessagePost);
    } catch (err) {
        res.json(err);
    }
});

//gets the users in a chat
router.get('/chats/users/:chat_id', checkJWT, async (req, res) => {
    try {
        const dbLookupUsers = await pg.get_users_in_chat(req.params.chat_id, req.username);
        res.json(dbLookupUsers.users);
    } catch (err) {
        res.json(err);
    }
});

//creates a new chat with the name and users
router.post('/chats/new', checkJWT, async (req, res) => {
    if (!req.body.chat_name || !req.body.chat_users) {
        res.json({error: 'invalid chat request'});
        return;
    }
    if (!req.body.chat_users.includes(req.username)) {
        req.body.chat_users.push(req.username);
    }
    try {
        await pg.create_transaction();
        const dbCreateChat = await pg.create_chat(req.body.chat_name);
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
            res.json({error: 'one of the users does not exist chat not created', db: err});
        }
    } catch (err) {
        await pg.rollback_transaction();
        res.json({error: 'chat_not_created', db: err});
    }
});

router.post('/chats/delete/:chat_id', checkJWT, async (req, res) => {
    try {
        await pg.delete_chat(req.params.chat_id, req.username);
        res.json({success: 'deleted chat'});
    } catch (err) {
        res.json(err);
    }
});

//creates a new chat with the name and users
router.post('/chats/edit/:chat_id', checkJWT, async (req, res) => {
    if (!req.body.chat_name || !req.body.chat_users) {
        res.json({error: 'invalid chat request'});
        return;
    }
    if (!req.body.chat_users.includes(req.username)) {
        req.body.chat_users.push(req.username);
    }
    try {
        const currentUsers = (await pg.get_users_in_chat(req.params.chat_id, req.username)).users.map((user) => user.username);
        if (!currentUsers.includes(req.username)) {
            res.json({error: 'user not in chat'});
            return;
        }
        const deletedUsers = currentUsers.filter((user) => {
            if (!req.body.chat_users.includes(user)) {
                return user;
            }
        });
        const newUsers = req.body.chat_users.filter((user) => {
            if (!currentUsers.includes(user)) {
                return user;
            }
        });
        await pg.create_transaction();
        const promises = [];
        newUsers.forEach((username) => {
            promises.push(pg.add_user_to_chat(username, req.params.chat_id));
        });
        deletedUsers.forEach((username) => {
            promises.push(pg.remove_user_from_chat(username, req.params.chat_id));
        });
        promises.push(pg.edit_chat_name(req.body.chat_name, req.params.chat_id));
        try {
            await Promise.all(promises);
            await pg.commit_transaction();
            res.json({success: 'chat_edited'});
        } catch (err) {
            await pg.rollback_transaction();
            res.json({error: 'something is wrong', db: err});
        }
    } catch (err) {
        await pg.rollback_transaction();
        res.json({error: 'chat_not_edited', db: err});
    }
});

module.exports = router;