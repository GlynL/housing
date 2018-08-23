function redirectPage(req, res, next) {
  req.session.redirectPage = req.path;
  next();
}

module.exports = redirectPage;
