exports.login = (req, res) => res.render("user-login");

exports.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};
