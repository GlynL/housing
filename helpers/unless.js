// https://stackoverflow.com/questions/27117337/exclude-route-from-express-middleware
var unless = function(middleware, ...paths) {
  return function(req, res, next) {
    const pathCheck = paths.some(path => path === req.path);
    pathCheck ? next() : middleware(req, res, next);
  };
};

module.exports = unless;
