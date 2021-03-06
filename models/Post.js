const postsCollection = require("../db")
  .db()
  .collection("posts");
const ObjectID = require("mongodb").ObjectID;
const User = require("./User");
const sanitizeHTML = require("sanitize-html");
class Post {
  constructor(data, userid, requestedPostId) {
    this.data = data;
    this.errors = [];
    this.userid = userid;
    this.requestedPostId = requestedPostId;
  }
  cleanUp() {
    if (typeof this.data.title != "string") {
      this.data.title = "";
    }
    if (typeof this.data.body != "string") {
      this.data.body = "";
    }
    //get rid of any bogus  properties
    this.data = {
      title: sanitizeHTML(this.data.title.trim(), {
        allowedTags: [],
        allowedAttributes: {}
      }),
      body: sanitizeHTML(this.data.body.trim(), {
        allowedTags: [],
        allowedAttributes: {}
      }),
      createdDate: new Date(),
      author: ObjectID(this.userid)
    };
  }
  validate() {
    if (this.data.title == "") {
      this.errors.push("You must provide a title.");
    }
    if (this.data.body == "") {
      this.errors.push("You must provide post content.");
    }
  }
  create() {
    return new Promise((resolve, reject) => {
      this.cleanUp();
      this.validate();
      if (!this.errors.length) {
        //save  post into database
        postsCollection
          .insertOne(this.data)
          .then(info => {
            resolve(info.ops[0]._id);
          })
          .catch(() => {
            this.errors.push("please try again later");
            reject(this.errors);
          });
      } else {
        reject(this.errors);
      }
    });
  }

  update() {
    return new Promise(async (resolve, reject) => {
      try {
        let post = await Post.findSinglePostByPostId(
          this.requestedPostId,
          this.userid
        );
        if (post.isVisitorOwner) {
          //actually update db
          let status = await this.actuallyUpdate();
          resolve(status);
        } else {
          reject();
        }
      } catch {
        reject();
      }
    });
  }

  actuallyUpdate() {
    return new Promise(async (resolve, reject) => {
      this.cleanUp();
      this.validate();
      if (!this.errors.length) {
        await postsCollection.findOneAndUpdate(
          { _id: new ObjectID(this.requestedPostId) },
          { $set: { title: this.data.title, body: this.data.body } }
        );
        resolve("success");
      } else {
        resolve("failure");
      }
    });
  }
}

Post.reusablePostQuery = (uniqueOperations, visitorId) => {
  return new Promise(async (resolve, reject) => {
    let aggOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "authorDocument"
        }
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          authorId: "$author",
          author: { $arrayElemAt: ["$authorDocument", 0] }
        }
      }
    ]);
    let posts = await postsCollection.aggregate(aggOperations).toArray();
    //clean up author property in each post object
    posts = posts.map(post => {
      post.isVisitorOwner = post.authorId.equals(visitorId);
      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar
      };
      console.log("this is the post object:", post);
      return post;
    });

    resolve(posts);
  });
};
Post.findSinglePostByPostId = (id, visitorId) => {
  return new Promise(async (resolve, reject) => {
    if (typeof id != "string" || !ObjectID.isValid(id)) {
      reject();
      return;
    }
    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectID(id) } }],
      visitorId
    );
    if (posts.length) {
      console.log(posts[0]);
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = authorId => {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } }
  ]);
};

Post.delete = (postIdToDelete, currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSinglePostByPostId(
        postIdToDelete,
        currentUserId
      );
      if (post.isVisitorOwner) {
        postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) });
      } else {
        reject();
      }
    } catch (e) {}
  });
};

module.exports = Post;
