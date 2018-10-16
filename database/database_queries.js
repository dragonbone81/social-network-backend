const pg = require('./database_connection');

pg.connect();

const create_user = async (user) => {
    try {
        await pg.query('INSERT INTO app_user VALUES ($1, $2, $3, $4, $5)',
            [user.username, user.password, user.firstname, user.lastname, user.email]);
        return ({success: "user_created"})
    } catch (err) {
        return ({error: err});
    }
};

// app.get('/users', async (req, res) => {
//     res.setHeader('Content-Type', 'application/json');
//     let query = "SELECT username, email, firstname, lastname FROM app_user";
//     if (Object.keys(req.query).length > 0) {
//         query += " WHERE";
//         if ('username' in req.query) {
//             query += " username LIKE $1"
//         }
//     }
//     console.log(query);
//     try {
//         const {rows} = await pg.query(query, [`%${req.query.username}%`]);
//         res.send(rows)
//     } catch (err) {
//         res.status(400);
//         res.send({error: err});
//     }
// });

module.exports.create_user = create_user;