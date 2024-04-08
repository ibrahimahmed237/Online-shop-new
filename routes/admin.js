const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth.js");

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/add-product => POST
router.post("/add-product", isAuth, adminController.postAddProduct);

// /admin/edit-product => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post("/edit-product", isAuth, adminController.postEditProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/delete-product => DELETE
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

module.exports = router;
