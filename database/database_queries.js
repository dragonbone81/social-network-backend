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
const get_user_password = async (username) => {
    const query = "SELECT password FROM app_user WHERE username=$1";
    try {
        const {rows} = await pg.query(query, [username]);
        if (rows.length === 1) {
            const password = rows[0].password;
            return {success: true, password: password};
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
module.exports.create_user_table = create_user_table;
module.exports.get_users = get_users;
module.exports.get_user_password = get_user_password;
module.exports.get_user = get_user;