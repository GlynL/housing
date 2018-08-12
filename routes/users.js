const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");
const userControllers = require("../controllers/users");

// register form
router.get("/register", (req, res) => res.render("user-register"));

// new user
router.post("/register", (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    function(err, user) {
      if (err) next(err);
      passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    }
  );
});

// login page
router.get("/login", userControllers.login);

// login action
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/user/login"
  }),
  (req, res) => {}
);

// logout
router.get("/logout", userControllers.logout);

module.exports = router;