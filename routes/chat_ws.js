const pg = require('../database/database_queries');
const checkJWT = require('../middleware/checkJWTWS');
const chat_ws = (socket, io) => {
    socket.on('chat_message', async (input) => {
        // console.log('chatted', input);
        try {
            const response = checkJWT(input.token);
            const dbMessagePost = await pg.create_message(input.chat_id, response.username, input.text, input.type);
            // console.log(dbMessagePost);
            socket.to(input.chat_id).emit('message', {
                message: {
                    username: socket.username,
                    created_at: dbMessagePost.created_at,
                    text: input.text,
                    message_id: dbMessagePost.message_id,
                    type: dbMessagePost.type,
                },
                chat_id: input.chat_id,
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
            socket.join(input.chat_id, () => {
                console.log(Object.keys(io.sockets.sockets));
            })
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('typing', async (input) => {
        try {
            const response = checkJWT(input.token);
            socket.to(input.chat_id).emit('typing', {
                isTyping: input.isTyping,
                username: socket.username,
                chat_id: input.chat_id,
            });
        } catch (err) {
            console.log(err);
        }
    });
};

module.exports.chat_ws = chat_ws;