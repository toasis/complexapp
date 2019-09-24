const User = require("../models/User");

exports.mustBeLoggedIn = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash("errors", "You must be logged in to perform that action");
    req.session.save(() => {
      res.redirect("/");
    });
  }
};

exports.register = (req, res) => {
  let user = new User(req.body);
  console.log(user);
  user
    .register()
    .then(() => {
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch(regErrors => {
      regErrors.map(error => {
        req.flash("regErrors", error);
      });
      req.session.save(() => {
        res.redirect("/");
      });
    });
};
exports.login = (req, res) => {
  let user = new User(req.body);
  user
    .login()
    .then(result => {
      req.session.user = {
        avatar: user.avatar,
        username: user.data.username,
        _id: user.data._id
      };
      req.session.save(() => {
        res.redirect("/");
      });
    })
    .catch(e => {
      req.flash("errors", e);
      req.session.save(() => {
        res.redirect("/");
      });
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
    res.render("home-dashboard");
  } else {
    res.render("home-guest", {
      errors: req.flash("errors"),
      regErrors: req.flash("regErrors")
    });
  }
};

exports.ifUserExists = (req, res, next) => {
  User.findByUsername(req.params.username)
    .then(userDocument => {
      req.profileUser = userDocument;
      next();
    })
    .catch(() => {
      res.render("404");
    });
};
exports.profilePostsScreen = (req, res) => {
  res.render("profile", {
    profileUsername: req.profileUser.username,
    profileAvatar: req.profileUser.avatar
  });
  console.log(req);
};
