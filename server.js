const express = require('express');
const morgan = require('morgan');
const pg = require('./database_connection');
const app = express();
const port = process.env.PORT || 3000;


pg.connect();

app.use(morgan('short'));

app.get('/', async (req, res) => {
    const {rows} = await pg.query("SELECT * FROM app_user WHERE username='cvernikoff'");
    // pg.query("INSERT INTO app_user VALUES ('abc123', 'abc123', 'Christian', 'V', 'cv@gmail.com')");
    // pg.query("INSERT INTO app_user VALUES ('superuser', 'abc123', 'Christian', 'V', 'cv@gmail.com')");
    console.log(rows[0]);
    const d = new Date(rows[0].created_at);
    console.log(d.toString());
    res.send("HELLO");
});

app.listen(port, () => console.log("Server Started!"));