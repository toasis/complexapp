exports.viewCreateScreen = (req, res) => {
  res.render("create-post", {
    username: req.session.username,
    avatar: req.session.user.avatar
  });
};
