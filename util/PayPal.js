const paypal = require("paypal-rest-sdk");
const dotenv = require("dotenv");
dotenv.config();

paypal.configure({
  mode: "sandbox",
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET,
});

module.exports.createPaypalPayment = async (payment) => {
  return new Promise((resolve, reject) => {
    paypal.payment.create(payment, function (err, payment) {
      if (err) {
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};

module.exports.executePaypalPayment = async (paymentId, payerId) => {
  return new Promise((resolve, reject) => {
    paypal.payment.execute(
      paymentId,
      { payer_id: payerId },
      function (err, payment) {
        if (err) {
          reject(err);
        } else {
          resolve(payment);
        }
      }
    );
  });
};

module.exports.getPaypalPayment = async (paymentId) => {
  return new Promise((resolve, reject) => {
    paypal.payment.get(paymentId, function (err, payment) {
      if (err) {
        reject(err);
      } else {
        resolve(payment);
      }
    });
  });
};