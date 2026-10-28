
const oracledb = require('oracledb');

let pool;

async function initializeDatabase() {
  if (pool) return pool;

  pool = await oracledb.createPool({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
    poolMin: 1,
    poolMax: 5,
    poolIncrement: 1,
  });

  console.log('SpiceNest Oracle connection pool initialized');
  return pool;
}

async function getConnection() {
  if (!pool) {
    throw new Error(
      'Oracle connection pool is not initialized. Initialize the database first.'
    );
  }

  return pool.getConnection();
}

async function closeDatabase() {
  if (pool) {
    await pool.close(10);
    pool = undefined;
    console.log('SpiceNest Oracle connection pool closed');
  }
}

module.exports = {
  initializeDatabase,
  getConnection,
  closeDatabase,
};
