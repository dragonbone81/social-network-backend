const pg = require('./database_connection');
// const client = pg.connect();
const client = pg.connect();
const create_transaction = async () => {
    (await client).query('BEGIN');
};
const commit_transaction = async () => {
    (await client).query('COMMIT');
};
const rollback_transaction = async () => {
    (await client).query('ROLLBACK');
};
const create_user = async (user) => {
    try {
        await (await client).query('INSERT INTO app_user VALUES ($1, $2, $3, $4, $5)',
            [user.username, user.password, user.firstname, user.lastname, user.email]);
        return ({success: "user_created"})
    } catch (err) {
        throw {error: err};
    }
};

const check_for_users = async (userList) => {
    try {
        const {rows} = await (await client).query(`SELECT username FROM app_user WHERE username IN 
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
        const {rows} = await (await client).query('INSERT INTO chat (chat_name) VALUES ($1) RETURNING chat_id',
            [chatName]);
        return ({success: "chat_created", chat_id: rows[0].chat_id})
    } catch (err) {
        throw {error: err};
    }
};

const add_user_to_group = async (username, group_id) => {
    try {
        await (await client).query('INSERT INTO user_group VALUES ($1, $2)',
            [username, group_id]);
        return ({success: "user added to group"})
    } catch (err) {
        return {error: err};
    }
};
const create_post = async (group_id, username, text) => {
    //check if user in group
    try {
        const userCheck = await (await client).query('SELECT group_id FROM user_group WHERE group_id=$1 AND username=$2',
            [group_id, username]);
        if (userCheck.rows.length !== 1) {
            return {error: 'user_not_in_group'};
        }
        const {rows} = await (await client).query('INSERT INTO post (group_id, username, text) VALUES ($1, $2, $3) RETURNING post_id',
            [group_id, username, text]);
        return ({success: "post_created", post_id: rows[0].post_id})
    } catch (err) {
        return {error: err};
    }
};
const create_like = async (group_id, post_id, username) => {
    //check if user in group
    try {
        const userCheck = await (await client).query('SELECT group_id FROM user_group WHERE group_id=$1 AND username=$2',
            [group_id, username]);
        if (userCheck.rows.length !== 1) {
            return {error: 'user_not_in_group'};
        }
        const {rows} = await (await client).query('INSERT INTO app_like (post_id, username) VALUES ($1, $2) RETURNING like_id',
            [post_id, username]);
        return ({success: "like_created", like_id: rows[0].like_id})
    } catch (err) {
        return {error: err};
    }
};

const create_group = async (groupName) => {
    try {
        const {rows} = await (await client).query('INSERT INTO app_group (group_name) VALUES ($1) RETURNING group_id',
            [groupName]);
        return ({success: "group_created", group_id: rows[0].group_id})
    } catch (err) {
        return {error: err};
    }
};

const add_user_to_chat = async (username, chat_id) => {
    try {
        await (await client).query('INSERT INTO user_chat VALUES ($1, $2)',
            [username, chat_id]);
        return {success: "user added to chat"}
    } catch (err) {
        throw {error: err};
    }
};

const get_chats_for_user = async (username) => {
    try {
        const {rows} = await (await client).query('SELECT chat.chat_id, chat_name FROM chat, user_chat WHERE username=$1 AND user_chat.chat_id=chat.chat_id',
            [username]);
        return ({success: "chats for user", chats: rows})
    } catch (err) {
        throw {error: err};
    }
};

const get_groups_for_user = async (username) => {
    try {
        const {rows} = await (await client).query('SELECT app_group.group_id, group_name FROM app_group, user_group WHERE username=$1 AND user_group.group_id=app_group.group_id',
            [username]);
        return ({success: "groups for user", groups: rows})
    } catch (err) {
        return {error: err};
    }
};

const get_users_in_chat = async (chat_id, username) => {
    try {
        await check_if_user_in_chat(chat_id, username);
        const {rows} = await (await client).query('SELECT username FROM user_chat WHERE chat_id=$1',
            [chat_id]);
        return ({success: "users in chat", users: rows});
    } catch (err) {
        throw {error: err};
    }
};
const get_users_in_group = async (group_id, username) => {
    try {
        const {rows} = await (await client).query('SELECT username FROM user_group WHERE group_id=$1',
            [group_id]);
        if (rows.find((el) => el.username === username))
            return ({success: "users in group", users: rows});
        else
            return {error: 'user_not_in_group'};
    } catch (err) {
        return {error: err};
    }
};
const get_posts_for_group = async (group_id, username) => {
    // check the user is in the group
    try {
        const userCheck = await (await client).query('SELECT group_id FROM user_group WHERE group_id=$1 AND username=$2',
            [group_id, username]);
        if (userCheck.rows.length !== 1) {
            return {error: 'user_not_in_group'};
        }
        const {rows} = await (await client).query('SELECT username, created_at, text, post_id FROM post WHERE group_id=$1',
            [group_id]);
        return ({success: "posts for group", posts: rows});
    } catch (err) {
        return {error: err};
    }
};
const get_likes_for_post = async (post_id, group_id, username) => {
    // check the user is in the group
    try {
        const userCheck = await (await client).query('SELECT group_id FROM user_group WHERE group_id=$1 AND username=$2',
            [group_id, username]);
        if (userCheck.rows.length !== 1) {
            return {error: 'user_not_in_group'};
        }
        const {rows} = await (await client).query('SELECT username, like_id FROM app_like WHERE post_id=$1',
            [post_id]);
        return ({success: "likes for post", likes: rows});
    } catch (err) {
        return {error: err};
    }
};

const get_messages_for_chat = async (chat_id, username) => {
    // check the user is in the chat
    try {
        await check_if_user_in_chat(chat_id, username);
        const {rows} = await (await client).query('SELECT username, created_at, text, message_id FROM message WHERE chat_id=$1',
            [chat_id]);
        return ({success: "messages for chat", messages: rows});
    } catch (err) {
        throw {error: err};
    }
};

const check_if_user_in_chat = async (chat_id, username) => {
    const userCheck = await (await client).query('SELECT chat_id FROM user_chat WHERE chat_id=$1 AND username=$2',
        [chat_id, username]);
    if (userCheck.rows.length !== 1) {
        throw 'user_not_in_chat';
    }
};
const create_message = async (chat_id, username, text) => {
    //check if user in chat
    try {
        await check_if_user_in_chat(chat_id, username);
        const {rows} = await (await client).query('INSERT INTO message (chat_id, username, text) VALUES ($1, $2, $3) RETURNING message_id, created_at',
            [chat_id, username, text]);
        return ({success: "message_created", message_id: rows[0].message_id, created_at: rows[0].created_at})
    } catch (err) {
        throw {error: err};
    }
};

const create_post_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS post');
        await (await client).query('CREATE TABLE post (' +
            '    post_id     SERIAL PRIMARY KEY,' +
            '    group_id    INT NOT NULL,' +
            '    username    VARCHAR(40) NOT NULL,' +
            '    text        TEXT,' +
            '    created_at  TIMESTAMP DEFAULT NOW()' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const create_like_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS app_like');
        await (await client).query('CREATE TABLE app_like (' +
            '    like_id     SERIAL PRIMARY KEY,' +
            '    post_id     INT NOT NULL,' +
            '    username    VARCHAR(40) NOT NULL' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const create_group_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS app_group CASCADE');
        await (await client).query('CREATE TABLE app_group (' +
            '    group_id     SERIAL PRIMARY KEY,' +
            '    group_name   VARCHAR(60)' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const create_UserGroup_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS user_group');
        await (await client).query('CREATE TABLE user_group (' +
            '    username     VARCHAR(40) NOT NULL REFERENCES app_user(username) ON DELETE CASCADE,' +
            '    group_id     INT NOT NULL REFERENCES app_group(group_id) ON DELETE CASCADE,' +
            '    PRIMARY KEY (group_id, username)' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const create_user_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS app_user CASCADE');
        await (await client).query('CREATE TABLE app_user (' +
            '    username    VARCHAR(40) PRIMARY KEY,' +
            '    password    CHAR(60) NOT NULL,' +
            '    firstname   VARCHAR(30),' +
            '    lastname    VARCHAR(30),' +
            '    email       VARCHAR(40),' +
            '    created_at  TIMESTAMP DEFAULT NOW()' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const create_UserChat_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS user_chat');
        await (await client).query('CREATE TABLE user_chat (' +
            '    username    VARCHAR(40) NOT NULL REFERENCES app_user ON DELETE CASCADE,' +
            '    chat_id     INT NOT NULL REFERENCES chat ON DELETE CASCADE,' +
            '    PRIMARY KEY (chat_id, username)' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const create_message_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS message');
        await (await client).query('CREATE TABLE message (' +
            '    username    VARCHAR(40) NOT NULL REFERENCES app_user(username) ON DELETE CASCADE,' +
            '    chat_id     INT NOT NULL REFERENCES chat(chat_id) ON DELETE CASCADE,' +
            '    message_id  SERIAL PRIMARY KEY,' +
            '    text        TEXT,' +
            '    created_at  TIMESTAMP DEFAULT NOW()' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const create_chat_table = async () => {
    try {
        await (await client).query('DROP TABLE IF EXISTS chat CASCADE');
        await (await client).query('CREATE TABLE chat (' +
            '    chat_id     SERIAL PRIMARY KEY,' +
            '    chat_name   VARCHAR(60)' +
            ');');
    } catch (err) {
        return {error: err}
    }
};
const get_user_with_password = async (username) => {
    try {
        const {rows} = await (await client).query("SELECT username, email, firstname, lastname, password FROM app_user WHERE username=$1", [username]);
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
    try {
        const {rows} = await (await client).query("SELECT username, firstname, lastname, email, created_at FROM app_user WHERE username=$1", [username]);
        if (rows.length === 1) {
            return {success: true, user: rows[0]};
        } else {
            return {error: 'no or more than 1 rows returned'};
        }
    } catch (err) {
        throw {error: err};
    }
};
const get_users = async (queryItem) => {
    let query = "SELECT username, firstname, lastname FROM app_user WHERE lower(username) LIKE $1 OR lower(firstname) LIKE $1 OR lower(lastname) LIKE $1";
    try {
        const {rows} = await (await client).query(query, [`%${queryItem.toLocaleLowerCase()}%`]);
        return rows;
    } catch (err) {
        return {error: err};
    }
};

module.exports.create_user = create_user;
module.exports.create_chat = create_chat;
module.exports.create_group = create_group;
module.exports.add_user_to_chat = add_user_to_chat;
module.exports.create_user_table = create_user_table;
module.exports.create_UserChat_table = create_UserChat_table;
module.exports.create_chat_table = create_chat_table;
module.exports.create_message_table = create_message_table;
module.exports.create_post_table = create_post_table;
module.exports.create_like_table = create_like_table;
module.exports.create_group_table = create_group_table;
module.exports.create_UserGroup_table = create_UserGroup_table;
module.exports.create_message = create_message;
module.exports.get_messages_for_chat = get_messages_for_chat;
module.exports.get_users = get_users;
module.exports.get_user_with_password = get_user_with_password;
module.exports.get_user = get_user;
module.exports.get_chats_for_user = get_chats_for_user;
module.exports.get_users_in_chat = get_users_in_chat;
module.exports.check_for_users = check_for_users;
module.exports.add_user_to_group = add_user_to_group;
module.exports.create_group = create_group;
module.exports.get_posts_for_group = get_posts_for_group;
module.exports.get_users_in_group = get_users_in_group;
module.exports.get_groups_for_user = get_groups_for_user;
module.exports.create_like = create_like;
module.exports.get_likes_for_post = get_likes_for_post;
module.exports.create_post = create_post;
module.exports.create_transaction = create_transaction;
module.exports.commit_transaction = commit_transaction;
module.exports.rollback_transaction = rollback_transaction;