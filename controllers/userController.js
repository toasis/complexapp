const User = require("../models/User");

exports.register = (req, res) => {
  let user = new User(req.body);
  console.log(user);
  user.register();
  if (user.errors.length) {
    res.send(user.errors);
  } else {
    res.send("Congrats, there are no errors");
  }
};
exports.login = (req, res) => {
  let user = new User(req.body);
  user
    .login()
    .then(result => {
      res.send(result);
    })
    .catch(e => {
      res.send(e);
    });
};
exports.logout = () => {};
exports.home = (req, res) => {
  res.render("home-guest");
};
