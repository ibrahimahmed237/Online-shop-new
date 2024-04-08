const { mySqlConnection } = require("../util/db");
const db = mySqlConnection();

class Order {
  constructor(userId, user_email, paymentId, paymentStatus, payerID) {
    this.user_email = user_email;
    this.userId = userId;
    this.paymentId = paymentId;
    this.paymentStatus = paymentStatus;
    this.payerID = payerID;
  }

  async save() {
    try {
      const res = await db.execute(
        "INSERT INTO orders (userId, user_email, paymentId, paymentStatus, payerID) VALUES (?, ?, ?, ?, ?)",
        [
          this.userId,
          this.user_email,
          this.paymentId,
          this.paymentStatus,
          this.payerID,
        ]
      );
      this._id = res[0].insertId;
      return {
        _id: this._id,
        userId: this.userId,
        user_email: this.user_email,
        paymentId: this.paymentId,
        paymentStatus: this.paymentStatus,
        payerID: this.payerID,
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  static async fetchById(id) {
    try {
      const [rows] = await db.execute("SELECT * FROM orders WHERE _id = ?", [
        id,
      ]);
      return rows;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async fetchByUserId(userId) {
    try {
      const [rows] = await db.execute("SELECT * FROM orders WHERE userId = ?", [
        userId,
      ]);
      return rows;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async findOrderByPaymentId(paymentId) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM orders WHERE paymentId = ?",
        [paymentId]
      );
      return rows;
    } catch (err) {
      throw new Error(err);
    }
  }

  async addProducts(products) {
    try {
      const orderId = this._id;

      for (let product of products) {
        await db.execute(
          "INSERT INTO order_products (order_id,product_id,product_quantity) VALUES (?, ?, ?)",
          [orderId, product.product._id.toString(), product.quantity]
        );
      }
    } catch (err) {
      throw new Error(err);
    }
  }
}

module.exports = Order;
