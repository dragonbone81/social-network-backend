const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pg = require('./database/database_queries');
const app = express();
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const chatRoutesWS = require('./routes/chat_ws');
const groupRoutesWS = require('./routes/group_ws');
const groupRoutes = require('./routes/group');
const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log("Server Started!"));
const io = require('socket.io')(server);


app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(userRoutes);
app.use(authRoutes);
app.use(chatRoutes);
app.use(groupRoutes);

app.get('/', async (req, res) => {
    // pg.create_chat_table();
    // pg.create_UserChat_table();
    // pg.create_message_table();
    // const chat_id = await pg.create_chat("new_chat");
    // console.log(chat_id);
    // pg.add_user_to_chat('cvernikoff2', 3);
    // console.log(await pg.get_users_in_chat(3));
    // console.log(await pg.create_message(3, 'cvernikoff2', 'this is message4'));
    // console.log(await pg.get_messages_for_chat(3));
    // res.send(await pg.get_messages_for_chat(3));
    // console.log(await pg.check_for_users(['cvernikoff2', 'cvernikoff1']));
    // pg.create_message_table();
    // pg.create_chat_table();
    // pg.create_UserChat_table();
    // pg.create_user_table();
    // await pg.create_post_table();
    // console.log(await pg.create_like_table());
    // console.log(await pg.create_group_table());
    // console.log(await pg.create_UserGroup_table());
    // console.log(await pg.create_UserChat_table());
    // console.log(await pg.create_chat_table());
    // console.log(await pg.create_group_table());
    // console.log(await pg.create_UserGroup_table());
    // console.log(await pg.create_user_table());
    // console.log(await pg.create_message_table());
    // console.log(await pg.create_message_table());
    // console.log(await pg.create_user_table());
    // console.log(await pg.create_message_table());
    // pg.create_group();
    // console.log(await pg.create_group());
    //  pg.create_post();
    // console.log(await pg.create_post());
    res.send({hello: 'hi'})
});

io.on('connection', (socket) => {
    // console.log(io.sockets.sockets);
    chatRoutesWS.chat_ws(socket, io);
    groupRoutesWS.group_ws(socket, io);
});

