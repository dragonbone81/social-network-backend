const express = require('express');
const pg = require('../database/database_queries');
const router = express.Router();
const checkJWT = require('../middleware/checkJWT');

//get a user's groups
router.get('/groups/user', checkJWT, async (req, res) => {
    try {
        const dbLookupGroups = await pg.get_groups_for_user(req.username);
        res.json(dbLookupGroups.groups);
    } catch (err) {
        res.json(err);
    }
});

//get posts of all groups for one user
router.get('/groups/user/allposts', checkJWT, async (req, res) => {
   try {
       const dbGetAllGroupPosts = await pg.get_posts_of_groups_for_user(req.username);
       res.json(dbGetAllGroupPosts.posts);
   }  catch (err) {
       res.json(err);
   }
});

//gets the posts of a group
router.get('/groups/posts/:group_id', checkJWT, async (req, res) => {
    try {
        const dbLookupPosts = await pg.get_posts_for_group(req.params.group_id, req.username);
        res.json(dbLookupPosts);
    } catch (err) {
        res.json(err);
    }
});

//gets users in a group
router.get('/groups/users/:group_id', checkJWT, async (req, res) => {
    try {
        const dbLookupUsers = await pg.get_users_in_group(req.params.group_id, req.username);
        res.json(dbLookupUsers);
    } catch (err) {
        res.json(err);
    }
});

//gets likes on a post
router.get('/groups/posts/likes/:group_id/:post_id', checkJWT, async (req, res) => {
    try {
        const dbLookupLikes = await pg.get_likes_for_post(req.params.post_id, req.params.group_id, req.username);
        res.json(dbLookupLikes);
    } catch (err) {
        res.json(err);
    }
});

router.get('/groups/:group_id', checkJWT, async (req,res) => {
    try {
        const dbGroupInfo = await pg.get_group_info(req.params.group_id);
        res.json(dbGroupInfo);
    } catch (err) {
        res.json(err);
    }
});

//add like to post
router.post('/groups/posts/like/:group_id/:post_id', checkJWT, async (req, res) => {
    if (!req.body.group_id || !req.body.username) {
        res.json({error: 'invalid group request'});
        return;
    }
    try {
        const dbLikePost = await pg.create_like(req.params.group_id, req.params.post_id, req.username);
        res.json(dbLikePost);
    } catch (err) {
        res.json(err);
    }
});

//delete like on a post
router.post('/groups/like/delete/:group_id/:post_id', checkJWT, async (req,res) => {
    if (!req.body.group_id || !req.body.username) {
        res.json({error: 'invalid group request'});
        return;
    }
   try {
       const dbDeleteLike = await pg.delete_like(req.params.group_id, req.params.post_id, req.username);
       res.json(dbDeleteLike);
   } catch(err) {
       res.json(err);
   }
});

//add post in group
router.post('/groups/post/:group_id', checkJWT, async (req, res) => {
    if (!req.body.group_id || !req.body.username) {
        res.json({error: 'invalid group request'});
        return;
    }

    try {
        const dbGroupPost = await pg.create_post(req.params.group_id, req.username, req.body.text);
        res.json(dbGroupPost);
    } catch (err) {
        res.json(err);
    }
});

//create a new group with the name and users
router.post('/groups/new', checkJWT, async (req, res) => {

    if (!req.body.group_name || !req.body.group_users) {
        res.json({error: 'invalid group request'});
        return;
    }

    if (!req.body.group_users.includes(req.username)) {
        req.body.group_users.push(req.username);
    }

    try {
        await pg.create_transaction();
        const dbCreateGroup = await pg.create_group(req.body.group_name);
        const promises = [];
        req.body.group_users.forEach((username) => {
            promises.push(pg.add_user_to_group(username, dbCreateGroup.group_id));
        });
        try {
            await Promise.all(promises);
            await pg.commit_transaction();
            res.json({success: 'group_created', group_id: dbCreateGroup.group_id});
        }
        catch (err) {
            await pg.rollback_transaction();
            res.json({error: 'one of the users does not exist group not created', db: err});
        }
    }
    catch (err) {
        await pg.rollback_transaction();
        res.json({error: 'group_not_created', db: err});
    }
});

module.exports = router;