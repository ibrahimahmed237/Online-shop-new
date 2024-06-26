const path = require("path");
const express = require("express");
const { mongooseConnect, createDatabaseAndTables } = require("./util/db.js");
const session = require("express-session");
const helmet = require("helmet");
const compression = require("compression");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
require("dotenv").config();
const User = require("./models/user");
const errorController = require("./controllers/error");

mongooseConnect();
createDatabaseAndTables();

const app = express();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collections: "sessions",
});

app.use(helmet());
app.use(compression());
const csrfProtection = csrf();
app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my secSession",
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  //  res.locals.csrfToken = "g";

  next();
});

app.use(async (req, res, next) => {
  if (!req.session.user) return next();
  try {
    const user = await User.findById(req.session.user._id);
    if (!user) return next();
    req.user = user;
    next();
  } catch (err) {
    next(new Error(err));
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
    csrfToken: req.csrfToken(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
