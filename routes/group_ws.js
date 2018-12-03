const pg = require('../database/database_queries');
const checkJWT = require('../middleware/checkJWTWS');
const group_ws = (socket, io) => {
    socket.on('group_post', async (input) => {
        try {
            const response = checkJWT(input.token);
            const dbWritePost = await pg.create_post(input.group_id, response.username, input.text);
            // console.log(dbWritePost);
            socket.to(input.group_id).emit('post', {
                post: {
                    username: socket.username,
                    created_at: dbWritePost.created_at,
                    text: input.text,
                    message_id: dbWritePost.message_id,
                },
                group_id: input.group_id,
            });
            // console.log(dbMessagePost);
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