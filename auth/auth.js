const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {secretKey} = require('./secrets');

const hashPassword = (password) => {
    return bcrypt.hash(password, 8);
};
const comparePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};
const signJWT = (username) => {
    return jwt.sign({username: username}, secretKey, {
        expiresIn: 86400*31 // expires in 31 days
    });
};
const verifyJWT = (token) => {
    try {
        return {success: true, username: jwt.verify(token, secretKey).username};
    } catch (e) {
        return {error: e};
    }
};
module.exports.hashPassword = hashPassword;
module.exports.comparePassword = comparePassword;
module.exports.signJWT = signJWT;
module.exports.verifyJWT = verifyJWT;