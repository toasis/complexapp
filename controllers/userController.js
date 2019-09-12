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
      req.session.user = {
        favColor: "blue",
        username: user.data.username
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch(e => {
      res.send(e);
    });
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
};
exports.home = (req, res) => {
  if (req.session.user) {
    console.log(req.session.user);
    res.render("home-dashboard", { username: req.session.user.username });
  } else {
    res.render("home-guest");
  }
};
