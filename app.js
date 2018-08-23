const express = require("express");
const methodOverride = require("method-override");
const app = express();
const dotenv = require("dotenv").config();
const cloudinary = require("cloudinary");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/User");
const houseRoutes = require("./routes/houses");
const userRoutes = require("./routes/users");
const currentUser = require("./middleware/currentUser");
const redirectPage = require("./middleware/redirectPage");
const unless = require("./helpers/unless");

//
// --------- CONFIG ---------
//

const PORT = process.env.PORT;

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(
  require("express-session")({
    secret: "dafdklavndakljfieanlkdnadl",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
// passport config
passport.use(
  new LocalStrategy(
    {
      usernameField: "email"
    },
    User.authenticate()
  )
);
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

app.use(methodOverride("_method"));

// connectto database

mongoose.set("debug", true);

mongoose.connect(
  `mongodb://${process.env.MLAB_USER}:${
    process.env.MLAB_PASSWORD
  }@ds121182.mlab.com:21182/paihousing`
);
mongoose.promise = Promise;

// custom middleware
app.use(currentUser);

app.use(unless(redirectPage, "/user/login", "/user/register", "/user/logout"));

// setup cloudinary with account info
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

//
// --------- ROUTES -----------
//

// home route
app.get("/", (req, res) => res.render("index", { page_name: "home" }));

// auth routes
app.use("/user", userRoutes);

// houses routes
app.use("/houses", houseRoutes);

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
