pg.query('CREATE TABLE app_user (' +
    '    username    VARCHAR(40) PRIMARY KEY,' +
    '    password    VARCHAR(40) NOT NULL,' +
    '    firstname   VARCHAR(30),' +
    '    lastname    VARCHAR(30),' +
    '    email       VARCHAR(40),' +
    '    created_at  TIMESTAMP DEFAULT NOW()' +
    ');');