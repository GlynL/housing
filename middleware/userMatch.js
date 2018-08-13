const House = require("../models/House");

async function userMatch(req, res, next) {
  if (!req.user) return res.redirect("/user/login");
  const currentUser = req.user.id;
  const house = await House.findById(req.params.id);
  const userMatch = String(house.user) === currentUser;
  if (userMatch) next();
  else res.redirect("/user/login");
}

module.exports = userMatch;
