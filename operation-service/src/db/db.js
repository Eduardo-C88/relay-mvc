const { Kysely, PostgresDialect } = require('kysely');
const pg = require('pg');
require('dotenv').config();

const db = new Kysely({
    dialect: new PostgresDialect({
        pool: new pg.Pool({
            connectionString: process.env.OPERATION_DATABASE_URL
        })
    })
});

module.exports = { db };