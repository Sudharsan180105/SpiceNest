
require('dotenv').config({
  path: require('path').join(__dirname, '.env'),
});

const oracledb = require('oracledb');

async function testConnection() {
  let connection;

  try {
    console.log('Testing SpiceNest Oracle connection...');

    connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING,
    });

    const result = await connection.execute(
      `SELECT USER AS CURRENT_USER,
              SYS_CONTEXT('USERENV', 'SERVICE_NAME') AS SERVICE_NAME
       FROM DUAL`
    );

    console.log('Oracle connection successful.');
    console.log('Connected user:', result.rows[0][0]);
    console.log('Service name:', result.rows[0][1]);
  } catch (error) {
    console.error('Oracle connection test failed.');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Connection close failed:', error.message);
      }
    }
  }
}

testConnection();
