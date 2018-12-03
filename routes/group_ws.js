const pg = require('../database/database_queries');
const checkJWT = require('../middleware/checkJWTWS');
const group_ws = (socket, io) => {
    socket.on('group_post', async (input) => {
        try {
            checkJWT(input.token);
            const dbWritePost = await pg.create_post(input.group_id, socket.username, input.text);
            const dbGetUser = await pg.get_user(socket.username);
            const dbGetGroup = await pg.get_group_info(input.group_id);
            socket.to(`group_${input.group_id}`).emit('post', {
                post: {
                    firstname: dbGetUser.user.firstname,
                    lastname: dbGetUser.user.lastname,
                    username: socket.username,
                    created_at: dbWritePost.post.created_at,
                    text: input.text,
                    post_id: dbWritePost.post.post_id,
                    group_name: dbGetGroup.info.group_name,
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
            socket.to(`group_${input.group_id}`).emit('like', {
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
    socket.on('group_join', async (input) => {
        console.log('join_request', 'sup');
        try {
            const response = checkJWT(input.token);
            socket.username = response.username;
            socket.join(`group_${input.group_id}`, () => {
                console.log(Object.keys(io.sockets.sockets));
            })
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('group_leave', async (input) => {
        console.log('leave_request', input);
        try {
            socket.leave(`group_${input.group_id}`, () => {
                console.log('left');
            })
        } catch (err) {
            console.log(err);
        }
    });

};

module.exports.group_ws = group_ws;