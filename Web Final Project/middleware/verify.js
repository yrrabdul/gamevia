const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.render("unauth");
  }
};
module.exports = isAuthenticated;
