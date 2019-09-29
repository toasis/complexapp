const Post = require("../models/Post");

exports.viewCreateScreen = (req, res) => {
  res.render("create-post");
};

exports.create = (req, res) => {
  let post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then(newId => {
      req.flash("success", "New post successfully created");
      req.session.save(() => {
        res.redirect(`/post/${newId}`);
      });
    })
    .catch(errors => {
      errors.forEach(error => {
        req.flash("errors", errors);
      });
      req.session.save(() => {
        res.redirect("create/post");
      });
    });
};
exports.viewSinglePost = async (req, res) => {
  try {
    let post = await Post.findSinglePostByPostId(req.params.id, req.visitorId);
    res.render("single-post-screen", { post: post });
  } catch (e) {
    res.render("404");
  }
};

exports.viewEditPostScreen = async (req, res) => {
  try {
    let post = await Post.findSinglePostByPostId(req.params.id, req.visitorId);

    if (post.isVisitorOwner) {
      res.render("edit-post", { post: post });
    } else {
      req.flash("errors", "You do not have permission to perform this action.");
      req.session.save(() => {
        res.redirect("/");
      });
    }
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

exports.delete = (req, res) => {
  Post.delete(req.params.id, req.visitorId)
    .then(() => {
      req.flash("success", "Post Successfully deleted");
      req.session.save(() => {
        res.redirect(`/profile/${req.session.user.username}`);
      });
    })
    .catch(() => {
      req.flash("errors", "You do not have permission to perform that action");
      req.session.save(() => {
        res.redirect("/");
      });
    });
};
