exports.register = (req, res) =>
  res.render("user-register", { page_name: "user-register" });

exports.login = (req, res) =>
  res.render("user-login", { page_name: "user-login" });

exports.logout = (req, res) => {
  req.logout();
  const page = req.session.redirectPage || "/";
  res.redirect(page);
};
