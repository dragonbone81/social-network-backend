module.exports = {
    user: process.env.DATABASE_USER || 'user',
    host: process.env.DATABASE_HOST || 'host',
    database: process.env.DATABASE_NAME || 'dn_name',
    password: process.env.DATABASE_PASSWORD || 'pw',
    port: process.env.DATABASE_PORT || 3000,
    secretKey: process.env.SECRET_KEY || 'secret'
};