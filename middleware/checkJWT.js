const auth = require('../auth/auth');

module.exports = (req, res, next) => {
    const {token} = req.headers;
    if (!token) {
        res.status(400);
        res.send({error: 'invalid token request'});
        return;
    }
    const verifiedJWT = auth.verifyJWT(token);
    if (verifiedJWT.success) {
        req.username = verifiedJWT.username;
        next();
    } else {
        res.status(400);
        res.send({error: 'invalid token'});
    }
};
