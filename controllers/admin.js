const Product = require("../models/product");
const path = require("path");
const productValidation = require("../validation/validation").productValidation;
const multer = require("multer");
const sharp = require("sharp");

exports.getAddProduct = (req, res, next) => {
  return res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
    editing: false,
    hasError: false,
    errorMessage: null,
    validationError: null,
  });
};

const upload = multer({
  limits: {
    fileSize: 2000000,
  },
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".bmp"];

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Please upload a picture with a .jpg, .png or .jpeg extension!"
        )
      );
    }
  },
});

const uploadSingleImage = upload.single("image");

exports.postAddProduct = async (req, res, next) => {
  try {
    uploadSingleImage(req, res, async function (err) {
      const { value, error } = productValidation.validate(req.body);
      const { title, price, description } = value;

      const product = new Product({
        title,
        price,
        description,
        userId: req.user._id,
      });

      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .toFormat("jpeg")
          .jpeg()
          .toBuffer();
        product.image = buffer;
      } else err = "Please upload a picture.";

      if (error || err) {
        return res.status(422).render("admin/edit-product", {
          pageTitle: "Add Product",
          path: "/admin/edit-product",
          formsCSS: true,
          productCSS: true,
          activeAddProduct: true,
          editing: false,
          product,
          hasError: true,
          errorMessage: error ? error.details[0].message : err,
          validationError: error ? error.details[0].path[0] : "",
          csrfToken: req.csrfToken(),
        });
      }
      await product.save();
      return res.redirect("/admin/products");
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.getEditProduct = async (req, res, next) => {
  try {
    const editMod = req.query.edit;
    if (!editMod) return res.redirect("/");

    const prodId = req.params.productId;
    const product = await Product.findById(prodId);
    return res.render("admin/edit-product", {
      product,
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMod,
      hasError: false,
      errorMessage: null,
      validationError: "",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    uploadSingleImage(req, res, async function (err) {
      const { value, error } = productValidation.validate(req.body);

      const prodId = req.body.productId;
      const product = await Product.findById(prodId);
      product.title = value.title;
      product.price = value.price;
      product.description = value.description;

      if (error || err) {
        return res.status(422).render("admin/edit-product", {
          pageTitle: "Add Product",
          path: "/admin/edit-product",
          formsCSS: true,
          productCSS: true,
          activeAddProduct: true,
          editing: true,
          product,
          hasError: true,
          errorMessage: error ? error.details[0].message : err,
          validationError: error ? error.details[0].path[0] : "",
        });
      }
      if (req.file) {
        const buffer = await sharp(req.file.buffer)
          .toFormat("jpeg")
          .jpeg()
          .toBuffer();
        product.image = buffer;
      }

      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }

      await product.save();
      return res.redirect("/admin/products");
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const prodId = req.params.productId;
    await Product.findOneAndDelete({ _id: prodId, userId: req.user._id });
    return res.status(200).json({ message: "Success!" });
  } catch (err) {
    res.status(500).json({ message: "Deleting product failed." });
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const prods = await Product.find({ userId: req.user._id }).populate(
      "userId"
    );
    return res.render("admin/products", {
      prods,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
