const pg = require('../database/database_queries');
const checkJWT = require('../middleware/checkJWTWS');
const chat_ws = (socket) => {
    socket.on('chat_message', async (input) => {
        console.log('chatted', input);
        try {
            const response = checkJWT(input.token);
            const dbMessagePost = await pg.create_message(input.chat_id, response.username, input.text);
            console.log(dbMessagePost);
        } catch (err) {
            console.log(err);
        }
    });
};

module.exports.chat_ws = chat_ws;