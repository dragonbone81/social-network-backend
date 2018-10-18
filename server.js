const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const pg = require('./database/database_queries');
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const app = express();
const port = process.env.PORT || 3001;

app.use(morgan('short'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());
app.use(userRoutes);
app.use(authRoutes);
app.use(chatRoutes);


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
    res.send({hello: 'hi'})
});

app.listen(port, () => console.log("Server Started!"));