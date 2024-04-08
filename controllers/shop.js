const Product = require("../models/product");
// const Order = require("../models/order");
const PDFDocument = require("pdfkit");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const Order = require("../models/orderSql.js");
const OrderItem = require("../models/orderItemSql.js");
const {
  createPaypalPayment,
  executePaypalPayment,
  getPaypalPayment,
} = require("../util/PayPal.js");

exports.getProducts = async (req, res, next) => {
  try {
    const currentPage = +req.query.page || 1;
    const perPage = 6;
    const totalProducts = await Product.countDocuments();

    const prods = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    return res.render("shop/product-list", {
      prods,
      pageTitle: "All Products",
      path: "/products",
      currentPage,
      hasNextPage: perPage * currentPage < totalProducts,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage + 1,
      prevPage: currentPage - 1,
      lastPage: Math.ceil(totalProducts / perPage),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    return res.render("shop/product-detail", {
      product,
      pageTitle: "Product-detail",
      path: "/product-detail",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const currentPage = +req.query.page || 1;
    const perPage = 6;
    const totalProducts = await Product.countDocuments();

    const prods = await Product.find({})
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return res.render("shop/index", {
      prods,
      pageTitle: "Shop",
      path: "/",
      currentPage,
      hasNextPage: perPage * currentPage < totalProducts,
      hasPrevPage: currentPage > 1,
      nextPage: currentPage + 1,
      prevPage: currentPage - 1,
      lastPage: Math.ceil(totalProducts / perPage),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//
exports.getCart = async (req, res, next) => {
  try {
    const products = await req.user.getCart();
    res.render("shop/cart", {
      path: "/cart",
      pageTitle: "Your Cart",
      products,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCart = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const product = await Product.findById(prodId);
    await req.user.addToCart(product);
    return res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    await req.user.removeFromCart(prodId);
    return res.redirect("/cart");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

// Updated Order to mysql and add payment 
exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    const items = await req.user.getCart();
    const products = items.map((i) => {
      return { product: { ...i.productId._doc }, quantity: i.quantity };
    });

    let paymentStatus = await executePaypalPayment(
      req.query.paymentId,
      req.query.PayerID
    );

    let foundOrder = await Order.findOrderByPaymentId(req.query.paymentId);
    if (foundOrder.length > 0) {
      return res.redirect("/orders");
    }

    let order = new Order(
      req.user._id.toString(),
      req.user.email,
      paymentStatus.id,
      paymentStatus.state,
      req.query.PayerID
    );

    // paymentStatus = JSON.stringify(paymentStatus);
    // console.log("paymentStatus", JSON.stringify(paymentStatus));

    await order.save();

    await order.addProducts(products);

    await req.user.clearCart();
    // return res.redirect("/orders");
    res.render("shop/success", {
      path: "/success",
      pageTitle: "Success",
      paymentId: req.query.paymentId,
    });
  } catch (err) {
    const error = new Error(err);
    console.log(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

// Updated Order to mysql
exports.getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    const ordersItems = await OrderItem.getOrdersByUserId(userId);

    // get payment details

    // const orders = await Order.fetchByUserId(userId);
    // const payment= await getPaypalPayment(orders[0].paymentId);

    res.render("shop/orders", {
      path: "/orders",
      pageTitle: "Your Orders",
      orders: ordersItems,
    });
  } catch (err) {
    const error = new Error(err);
    console.log(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

// Updated Order to mysql
exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;

    const order = await OrderItem.getOrder(orderId);

    if (!order) {
      return next(new Error("No order found."));
    }

    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized"));
    }

    const invoiceName = `invoice-${orderId}.pdf`;
    const invoicePath = path.join("data", invoiceName);

    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );

    pdfDoc.pipe(res);

    pdfDoc.fontSize(20).text("Invoice", { align: "center" });

    pdfDoc.fontSize(16).text(`\nOrder ID: ${orderId}`);
    pdfDoc.text("--------------------------------------------\n");

    let totalPrice = 0;
    order.products.forEach((product) => {
      pdfDoc
        .fontSize(14)
        .text(
          `\n${product.product.title} - ${product.quantity} x $${product.product.price}`
        );
      totalPrice += product.product.price * product.quantity;
    });

    pdfDoc.text("\n-----------------------\n");
    pdfDoc.fontSize(16).text(`Total Price: $${totalPrice}`);

    pdfDoc.end();
  } catch (err) {
    next(err);
  }
};

//Updated Payment to paypal
exports.getCheckout = async (req, res, next) => {
  try {
    const products = await req.user.getCart();
    let items = [];
    let totalPrice = 0;

    products.forEach((product) => {
      const itemPrice = +product.productId.price * product.quantity;
      totalPrice += itemPrice;

      items.push({
        name: product.productId.title,
        sku: product.productId._id.toString(),
        price: product.productId.price,
        currency: "USD",
        quantity: product.quantity,
      });
    });

    const create_payment_json = {
      intent: "sale",
      payer: {
        payment_method: "paypal",
      },
      redirect_urls: {
        return_url: `${req.protocol}://${req.get("host")}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
      },
      transactions: [
        {
          amount: {
            currency: "USD",
            total: totalPrice.toFixed(2),
          },
          item_list: {
            items: items,
          },
          description: "Buying products from our store.",
        },
      ],
    };

    const paypalPayment = await createPaypalPayment(create_payment_json);

    const approvalUrl = paypalPayment.links.find(
      (link) => link.rel === "approval_url"
    ).href;

    // console.log("approval_url", approvalUrl);
    // console.log("Create Payment Response");
    // console.log("transaction : " + paypalPayment);
    // let transactionId = paypalPayment.id;
    // console.log("id : " + transactionId);

    res.render("shop/checkout", {
      path: "/checkout",
      pageTitle: "Checkout",
      products,
      totalPrice,
      approvalUrl,
    });
  } catch (err) {
    const error = new Error(err);
    console.log(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

// exports.getCheckout = async (req, res, next) => {
//   try {
//     const products = await req.user.getCart();
//     let totalPrice = 0;
//     products.forEach((product) => {
//       totalPrice += +product.productId.price * +product.quantity;
//     });

//     let line_items = products.map((product) => ({
//       price_data: {
//         currency: "usd",
//         product_data: {
//           name: product.productId.title,
//         },
//         unit_amount: product.productId.price * 100,
//       },
//       quantity: product.quantity,
//     }));

//     const stripeSession = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items,
//       mode: "payment",
//       success_url: `${req.protocol}://${req.get("host")}/checkout/success`,
//       cancel_url: `${req.protocol}://${req.get("host")}/checkout/cancel`,
//     });
//     res.render("shop/checkout", {
//       path: "/checkout",
//       pageTitle: "Checkout",
//       products,
//       totalPrice,
//       sessionId: stripeSession.id,
//     });
//   } catch (err) {
//     const error = new Error(err);
//     error.httpStatusCode = 500;
//     return next(error);
//   }
// };
