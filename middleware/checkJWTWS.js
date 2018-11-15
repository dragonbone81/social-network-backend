const auth = require('../auth/auth');

module.exports = (token) => {
    if (!token) {
        throw {error: 'no_token'}
    }
    const verifiedJWT = auth.verifyJWT(token);
    if (verifiedJWT.success) {
        return {success: true, username: verifiedJWT.username};
    } else {
        throw {error: verifiedJWT};
    }
};
