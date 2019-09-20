const postsCollection = require("../db")
  .db()
  .collection("posts");
class Post {
  constructor(data) {
    this.data = data;
    this.errors = [];
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
      title: this.data.title.trim(),
      body: this.data.body.trim(),
      createdDate: new Date()
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
          .then(() => {
            resolve();
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
}
module.exports = Post;
