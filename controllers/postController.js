const Post = require("../models/Post");

exports.viewCreateScreen = (req, res) => {
  res.render("create-post");
};

exports.create = (req, res) => {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(() => {
      res.send("New post created.");
    })
    .catch(errors => {
      res.send(errors);
    });
};
exports.viewSingle = async (req, res) => {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post });
  } catch (e) {
    res.render("404");
  }
};

exports.viewEditScreen = async (req, res) => {
  try {
    let post = await Post.findSingleById(req.params.id);
    res.render("edit-post", { post: post });
  } catch (e) {
    res.render("404");
  }
};

exports.edit = (req, res) => {
  let post = new Post(req.body, req.visitorId, req.params.id);
  post
    .update()
    .then(status => {
      //the post is successfully updated in the database
      //OR user did have permission, but there were validation errors
      if (status == "success") {
        //post was update to db
        req.flash("success", "Post successfully updated.");
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      } else {
        post.errors.forEach(error => {
          req.flash("errors", error);
        });
        req.session.save(() => {
          res.redirect(`/post/${req.params.id}/edit`);
        });
      }
    })
    .catch(() => {
      // a post with the requested id doesn't exist
      // OR if the current visitor is not the owner of the request post
      req.flash("errors", "You do not have permission to perform that action");
      res.session.save(() => {
        res.redirect("/");
      });
    });
};
