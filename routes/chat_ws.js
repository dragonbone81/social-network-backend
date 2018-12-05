const pg = require('../database/database_queries');
const checkJWT = require('../middleware/checkJWTWS');
const chat_ws = (socket, io) => {
    socket.on('chat_message', async (input) => {
        // console.log('chatted', input);
        try {
            const response = checkJWT(input.token);
            const dbMessagePost = await pg.create_message(input.chat_id, response.username, input.text, input.type);
            const dbUser = await pg.get_user(socket.username);
            // console.log(dbMessagePost);
            socket.to(`chat_${input.chat_id}`).emit('message', {
                message: {
                    created_at: dbMessagePost.created_at,
                    text: input.text,
                    message_id: dbMessagePost.message_id,
                    type: dbMessagePost.type,
                    ...dbUser.user,
                },
                chat_id: input.chat_id,
            });
            // console.log(dbMessagePost);
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('chat_join', async (input) => {
        console.log('join_request', input);
        try {
            const response = checkJWT(input.token);
            socket.username = response.username;
            socket.join(`chat_${input.chat_id}`, () => {
                // console.log(Object.keys(io.sockets.sockets));
            })
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('chat_leave', async (input) => {
        console.log('leave_request', input);
        try {
            socket.leave(`chat_${input.chat_id}`, () => {
                console.log('left');
            })
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('chat_typing', async (input) => {
        try {
            const response = checkJWT(input.token);
            const dbUser = await pg.get_user(socket.username);
            socket.to(`chat_${input.chat_id}`).emit('typing', {
                isTyping: input.isTyping,
                username: socket.username,
                chat_id: input.chat_id,
                ...dbUser.user,
            });
        } catch (err) {
            console.log(err);
        }
    });
};

module.exports.chat_ws = chat_ws;