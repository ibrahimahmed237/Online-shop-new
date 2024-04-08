const Product = require("./product.js");
const Order = require("./orderSql.js");
const { mySqlConnection } = require("../util/db");
const db = mySqlConnection();

class OrderItem {
  constructor(order_id, product_id, quantity) {
    this.order_id = order_id;
    this.product_id = product_id;
    this.quantity = quantity;
  }

  async save() {
    try {
      await db.execute(
        "INSERT INTO order_products (order_id,product_id,quantity) VALUES (?, ?, ?)",
        [this.order_id, this.product_id, this.quantity]
      );
    } catch (err) {
      throw new Error(err);
    }
  }

  static async fetchByOrderId(order_id) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM order_products WHERE order_id = ?",
        [order_id]
      );
      return rows;
    } catch (err) {
      throw new Error(err);
    }
  }

  static async getOrdersByUserId(userId) {
    const ordersOld = await Order.fetchByUserId(userId);

    const orders = await Promise.all(
      ordersOld.map(async (order) => {
        const items = await OrderItem.fetchByOrderId(order._id);
        const products = await Promise.all(
          items.map(async (item) => {
            const product = await Product.findById(item.product_id);
            return {
              product: { ...product._doc },
              quantity: item.product_quantity,
            };
          })
        );
        return { _id: order._id, products };
      })
    );
           
    return orders;
  }

  static async getOrder(orderId) {
    const order = await Order.fetchById(orderId);
    const items = await OrderItem.fetchByOrderId(orderId);
    const products = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.product_id);
        return {
          product: { ...product._doc },
          quantity: item.product_quantity,
        };
      })
    );
    return { _id: order[0]._id, products, user: { userId: order[0].userId } };
  }
}

module.exports = OrderItem;