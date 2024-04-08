const mongoose = require("mongoose");
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const mongooseConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Mongoose Connected Successfully!!");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return error;
  }
};

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  database: process.env.MYSQL_DATABASE,
  password: process.env.MYSQL_PASSWORD,
});

const createDatabaseAndTables = async () => {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
  });

  let connectionPromise = connection.promise();
  const [rows] = await connectionPromise.query(
    `SELECT COUNT(*) AS db_exists
    FROM INFORMATION_SCHEMA.SCHEMATA
    WHERE SCHEMA_NAME = '${process.env.MYSQL_DATABASE}';`
  );
  // console.log(rows[0].db_exists);
  if (rows[0].db_exists == 0) {
    await connectionPromise.query(
      `CREATE DATABASE ${process.env.MYSQL_DATABASE}`
    );
    await connectionPromise.query(`USE ${process.env.MYSQL_DATABASE}`);
    await connectionPromise.query(`
      CREATE TABLE orders (
        _id int NOT NULL AUTO_INCREMENT,
        user_email varchar(255) NOT NULL,
        userId varchar(50) NOT NULL,
        paymentId varchar(100) DEFAULT NULL,
        PayerID varchar(100) DEFAULT NULL,
        paymentStatus varchar(45) NOT NULL,
        PRIMARY KEY (_id)
      )
    `);
    await connectionPromise.query(`
      CREATE TABLE order_products (
        _id int NOT NULL AUTO_INCREMENT,
        order_id int NOT NULL,
        product_id varchar(50) DEFAULT NULL,
        product_quantity int NOT NULL,
        PRIMARY KEY (_id),
        KEY order_id (order_id),
        KEY order_products_ibfk_2 (product_id),
        CONSTRAINT order_product_ibfk_1 FOREIGN KEY (order_id) REFERENCES orders (_id)
      )
    `);
  }

  await connectionPromise.end();
};
;
const mySqlConnection = () => pool.promise();

module.exports = { mongooseConnect, mySqlConnection, createDatabaseAndTables };
