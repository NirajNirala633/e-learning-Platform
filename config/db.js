const { Pool } = require("pg");

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    require: true,
  },
});

let client;

async function connectDB() {
  try {
    client = await pool.connect();
    const result = await client.query("SELECT version()");
    console.log(result.rows[0]);
  } catch(e) {
    console.log("Error while connecting to database", e);
  }
}

module.exports = {
  connectDB,
  getClient: () => client,
  pool
};