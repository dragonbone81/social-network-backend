const express = require('express');
const router = express.Router();
const pg = require('../database/database_queries');


// router.post('/auth/register', async (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     const user = req.body.user;
//     if (!user) {
//         res.send(JSON.stringify({success: false, error: 'User not provided'}));
//         return;
//     }
//     user.password = await auth.hashPassword(user.password);
//     try {
//         const createdUser = await models.Users.create(user);
//         const token = auth.signJWT(createdUser._id);
//         res.send(JSON.stringify({success: true, token: token}));
//     } catch (e) {
//         console.log(e);
//         res.send(JSON.stringify({success: false}));
//     }
// });