const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { sendEmail, sendResetEmail } = require("../email/email.js");
const crypto = require("crypto");
const {
  signupValidation,
  loginValidation,
} = require("../validation/validation");

exports.getLogin = async (req, res, next) => {
  try {
    if (req.session.isLoggedIn) return res.redirect("/");

    return res.render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage: null,
      oldInput: {
        email: "",
        password: "",
      },
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const { value, error } = loginValidation.validate(req.body);

    let err;
    const user = await User.findOne({ email: value.email });
    if (!user) err = "Invalid email or password.";
    else {
      const rightPassword = await bcrypt.compare(value.password, user.password);
      if (!rightPassword) err = "Invalid email or password.";
    }

    if (err || error) {
      return res.status(422).render("auth/login", {
        path: "/login",
        pageTitle: "login",
        errorMessage: err ? err : error.details[0].message,
        oldInput: {
          email: value.email,
          password: value.password,
        },
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;

    await req.session.save();
    return res.redirect("/");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.postLogout = async (req, res, next) => {
  try {
    return req.session.destroy((err) => {
      res.redirect("/");
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.getSignup = async (req, res, next) => {
  try {
    if (req.session.isLoggedIn) return res.redirect("/");

    return res.render("auth/signup", {
      path: "/signup",
      pageTitle: "signup",
      errorMessage: null,
      oldInput: {
        email: "",
        password: "",
        name: "",
        confirmPassword: "",
      },
      validationError: null,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSignup = async (req, res, next) => {
  try {
    const { value, error } = signupValidation.validate(req.body);
    const { email, password, name, confirmPassword } = value;

    let user = await User.findOne({ email });
    let err = null;
    if (user) err = "E-mail exists already.";

    if (err || error) {
      return res.status(422).render("auth/signup", {
        path: "/signup",
        pageTitle: "signup",
        errorMessage: err ? err : error.details[0].message,
        oldInput: {
          email,
          password,
          name,
          confirmPassword,
        },
        validationError: err ? "email" : error.details[0].path[0],
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user = new User({
      name,
      password: hashedPassword,
      email,
      cart: { items: [] },
    });
    await user.save();
    sendEmail(email);
    return res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.getReset = async (req, res, next) => {
  try {
    let msg = req.flash("error");
    msg.length > 0 ? (msg = msg[0]) : (msg = null);
    res.render("auth/reset", {
      path: "/reset",
      pageTitle: "Reset password",
      errorMessage: msg,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.postReset = async (req, res, next) => {
  try {
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString("hex");

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      await req.flash("error", "No account with this email found.");
      return res.redirect("/reset");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;

    await user.save();
    sendResetEmail(req.body.email, token);

    return res.redirect("/");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.getNewPassword = async (req, res, next) => {
  try {
    const token = req.params.token;
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.redirect("/login");
    }
    let msg = req.flash("error");
    msg.length > 0 ? (msg = msg[0]) : (msg = null);
    res.render("auth/new-password", {
      path: "/reset",
      pageTitle: "New password",
      errorMessage: msg,
      userId: user._id.toString(),
      passwordToken: token,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.postNewPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    const userId = req.body.userId;
    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    return res.redirect("/login");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
