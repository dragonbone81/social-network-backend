const pg = require('./database_connection');

pg.connect();

const create_user = async (user) => {
    try {
        await pg.query('INSERT INTO app_user VALUES ($1, $2, $3, $4, $5)',
            [user.username, user.password, user.firstname, user.lastname, user.email]);
        return ({success: "user_created"})
    } catch (err) {
        return {error: err};
    }
};

const check_for_users = async (userList) => {
    try {
        const {rows} = await pg.query(`SELECT username FROM app_user WHERE username IN 
        (${userList.map((el, index) => `$${index + 1}`).join(', ')})`, userList);
        if (userList.length === rows.length)
            return ({success: "users_exists"});
        else
            return {error: "users_do_not_exist", existing_users: rows};
    } catch (err) {
        return {error: err};
    }
};

const create_chat = async (chatName) => {
    try {
        const {rows} = await pg.query('INSERT INTO chat (chat_name) VALUES ($1) RETURNING chat_id',
            [chatName]);
        return ({success: "chat_created", chat_id: rows[0].chat_id})
    } catch (err) {
        return {error: err};
    }
};

const add_user_to_chat = async (username, chat_id) => {
    try {
        await pg.query('INSERT INTO user_chat VALUES ($1, $2)',
            [username, chat_id]);
        return ({success: "user added to chat"})
    } catch (err) {
        return {error: err};
    }
};

const get_chats_for_user = async (username) => {
    try {
        const {rows} = await pg.query('SELECT chat.chat_id, chat_name FROM chat, user_chat WHERE username=$1 AND user_chat.chat_id=chat.chat_id',
            [username]);
        return ({success: "chats for user", chats: rows})
    } catch (err) {
        return {error: err};
    }
};

const get_users_in_chat = async (chat_id, username) => {
    try {
        const {rows} = await pg.query('SELECT username FROM user_chat WHERE chat_id=$1',
            [chat_id]);
        if (rows.find((el) => el.username === username))
            return ({success: "users in chat", users: rows});
        else
            return {error: 'user_not_in_chat'};
    } catch (err) {
        return {error: err};
    }
};

const get_messages_for_chat = async (chat_id, username) => {
    // check the user is in the chat
    try {
        const userCheck = await pg.query('SELECT chat_id FROM user_chat WHERE chat_id=$1 AND username=$2',
            [chat_id, username]);

        if (userCheck.rows.length !== 1) {
            return {error: 'user_not_in_chat'};
        }
        const {rows} = await pg.query('SELECT username, created_at, text, message_id FROM message WHERE chat_id=$1',
            [chat_id]);
        return ({success: "messages for chat", messages: rows});
    } catch (err) {
        return {error: err};
    }
};

const create_message = async (chat_id, username, text) => {
    //check if user in chat
    try {
        const userCheck = await pg.query('SELECT chat_id FROM user_chat WHERE chat_id=$1 AND username=$2',
            [chat_id, username]);

        if (userCheck.rows.length !== 1) {
            return {error: 'user_not_in_chat'};
        }
        const {rows} = await pg.query('INSERT INTO message (chat_id, username, text) VALUES ($1, $2, $3) RETURNING message_id',
            [chat_id, username, text]);
        return ({success: "message_created", message_id: rows[0].message_id})
    } catch (err) {
        return {error: err};
    }
};

const create_user_table = async () => {
    await pg.query('DROP TABLE IF EXISTS app_user');
    await pg.query('CREATE TABLE app_user (' +
        '    username    VARCHAR(40) PRIMARY KEY,' +
        '    password    CHAR(60) NOT NULL,' +
        '    firstname   VARCHAR(30),' +
        '    lastname    VARCHAR(30),' +
        '    email       VARCHAR(40),' +
        '    created_at  TIMESTAMP DEFAULT NOW()' +
        ');');
};
const create_UserChat_table = async () => {
    await pg.query('DROP TABLE IF EXISTS user_chat');
    await pg.query('CREATE TABLE user_chat (' +
        '    username    VARCHAR(40) NOT NULL,' +
        '    chat_id     INT NOT NULL,' +
        '    PRIMARY KEY (chat_id, username)' +
        ');');
};
const create_message_table = async () => {
    await pg.query('DROP TABLE IF EXISTS message');
    await pg.query('CREATE TABLE message (' +
        '    username    VARCHAR(40) NOT NULL,' +
        '    chat_id     INT NOT NULL,' +
        '    message_id  SERIAL,' +
        '    text        TEXT,' +
        '    created_at  TIMESTAMP DEFAULT NOW(),' +
        '    PRIMARY KEY (username, chat_id, message_id)' +
        ');');
};
const create_chat_table = async () => {
    await pg.query('DROP TABLE IF EXISTS chat');
    await pg.query('CREATE TABLE chat (' +
        '    chat_id     SERIAL PRIMARY KEY,' +
        '    chat_name   VARCHAR(60)' +
        ');');
};
const get_user_with_password = async (username) => {
    const query = "SELECT username, email, firstname, lastname, password FROM app_user WHERE username=$1";
    try {
        const {rows} = await pg.query(query, [username]);
        if (rows.length === 1) {
            return {success: true, user: rows[0]};
        } else {
            return {error: 'no or more than 1 rows returned'};
        }
    } catch (err) {
        return {error: err};
    }
};
const get_user = async (username) => {
    const query = "SELECT username, firstname, lastname, email, created_at FROM app_user WHERE username=$1";
    try {
        const {rows} = await pg.query(query, [username]);
        if (rows.length === 1) {
            return {success: true, user: rows[0]};
        } else {
            return {error: 'no or more than 1 rows returned'};
        }
    } catch (err) {
        return {error: err};
    }
};
const get_users = async (params) => {
    let query = "SELECT username, email, firstname, lastname FROM app_user";
    if (Object.keys(params).length > 0) {
        query += " WHERE";
        if ('username' in params) {
            query += " username LIKE $1"
        }
    }
    try {
        const {rows} = await pg.query(query, Object.keys(params).map((key) => `%${params[key]}%`));
        return rows;
    } catch (err) {
        return {error: err};
    }
};

module.exports.create_user = create_user;
module.exports.create_chat = create_chat;
module.exports.add_user_to_chat = add_user_to_chat;
module.exports.create_user_table = create_user_table;
module.exports.create_UserChat_table = create_UserChat_table;
module.exports.create_chat_table = create_chat_table;
module.exports.create_message_table = create_message_table;
module.exports.create_message = create_message;
module.exports.get_messages_for_chat = get_messages_for_chat;
module.exports.get_users = get_users;
module.exports.get_user_with_password = get_user_with_password;
module.exports.get_user = get_user;
module.exports.get_chats_for_user = get_chats_for_user;
module.exports.get_users_in_chat = get_users_in_chat;
module.exports.check_for_users = check_for_users;