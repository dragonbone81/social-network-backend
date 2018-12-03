const pg = require('../database/database_queries');
const checkJWT = require('../middleware/checkJWTWS');
const group_ws = (socket, io) => {
    socket.on('group_post', async (input) => {
        try {
            checkJWT(input.token);
            const dbWritePost = await pg.create_post(input.group_id, socket.username, input.text);
            const dbGetUser = await pg.get_user_from_group(input.group_id, socket.username);
            // console.log(dbWritePost);
            socket.to(input.group_id).emit('post', {
                post: {
                    firstname: dbGetUser.firstname,
                    lastname: dbGetUser.lastname,
                    username: socket.username,
                    created_at: dbWritePost.created_at,
                    text: input.text,
                    post_id: dbWritePost.post_id,
                },
                group_id: input.group_id,
            });
            // console.log(dbWritePost);
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('like_post', async (input) => {
       try {
           checkJWT(input.token);
           const dbLikePost = await pg.create_like(input.group_id, input.post_id, socket.username);
           socket.to(input.post_id).emit('like', {
               like: {
                   username: socket.username,
                   post_id: dbLikePost.post_id,
               },
               group_id: input.group_id,
           });
       } catch (err) {
           console.log(err);
       }
    });
    socket.on('join', async (input) => {
        console.log('join_request', input);
        try {
            const response = checkJWT(input.token);
            socket.username = response.username;
            socket.join(input.group_id, () => {
                console.log(Object.keys(io.sockets.sockets));
            })
        } catch (err) {
            console.log(err);
        }
    });

};

module.exports.group_ws = group_ws;