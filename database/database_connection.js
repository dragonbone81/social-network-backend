const {Pool} = require('pg');
const pg = new Pool({
    user: process.env.DATABASE_USER || 'user',
    host: process.env.DATABASE_HOST || 'host',
    database: process.env.DATABASE_NAME || 'database',
    password: process.env.DATABASE_PASSWORD || 'pw',
    port: process.env.DATABASE_PORT || 3000,
    ssl: true
});

module.exports = pg;