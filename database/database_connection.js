const {Pool} = require('pg');
const {user, host, database, password, port} = require('../auth/secrets');
const pg = new Pool({
    user: user,
    host: host,
    database: database,
    password: password,
    port: port,
    ssl: true
});

module.exports = pg;