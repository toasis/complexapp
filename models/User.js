const bcrypt = require("bcryptjs");
const usersCollection = require("../db")
  .db()
  .collection("users");
console.log(usersCollection);
const validator = require("validator");
const md5 = require("md5");
class User {
  constructor(data, getAvatar) {
    this.data = data;
    this.errors = [];
    if (getAvatar == undefined) {
      getAvatar = false;
    }
    if (getAvatar) {
      this.getAvatar();
    }
  }

  cleanUp() {
    if (typeof this.data.username != "string") {
      this.data.username = "";
    }
    if (typeof this.data.email != "string") {
      this.data.email = "";
    }
    if (typeof this.data.password != "string") {
      this.data.password = "";
    }
    // get rid of any bogus properties
    this.data = {
      username: this.data.username.trim().toLowerCase(),
      email: this.data.email.trim().toLowerCase(),
      password: this.data.password
    };
  }
  //Step #1 :validate user data
  validate() {
    return new Promise(async (resolve, reject) => {
      if (this.data.username == "") {
        this.errors.push("You must provide a username.");
      }
      if (this.data.username.length > 0 && this.data.username.length < 3) {
        this.errors.push("You must provide a username at least 3 characters.");
      }
      if (this.data.username.length > 30) {
        this.errors.push("Your username can not exceed 30 characters.");
      }
      if (
        this.data.username != "" &&
        !validator.isAlphanumeric(this.data.username)
      ) {
        this.errors.push(
          "Your username can only contains letters and numbers."
        );
      } //validate username

      if (!validator.isEmail(this.data.email)) {
        this.errors.push("You must provide a email.");
      } //validate email

      if (this.data.password == "") {
        this.errors.push("You must provide a password.");
      }
      if (this.data.password.length > 0 && this.data.password.length < 12) {
        this.errors.push("Your password must be at least 12 characters ");
      }
      if (this.data.password.length > 20) {
        this.errors.push("Your password can not exceed 20 characters ");
      } //validate password

      //only if username is valid then check to see if it's already taken.
      if (
        this.data.username > 2 &&
        this.data.username.length < 21 &&
        validator.isAlphanumeric
      ) {
        let usernameExists = await usersCollection.findOne({
          username: this.data.username
        });
        if (usernameExists) {
          this.errors.push("That username is already taken.");
        }
      }
      //only if email is valid then check to see if it's already taken.
      if (validator.isEmail(this.data.email)) {
        let emailExists = await usersCollection.findOne({
          email: this.data.email
        });
        if (emailExists) {
          this.errors.push("That email is already taken.");
        }
      }
      resolve();
    });
  }

  login() {
    return new Promise((resolve, reject) => {
      this.cleanUp();
      usersCollection
        .findOne({ username: this.data.username })
        .then(attemptedUser => {
          if (
            attemptedUser &&
            bcrypt.compareSync(this.data.password, attemptedUser.password)
          ) {
            this.data = attemptedUser;
            this.getAvatar();
            resolve(
              "Congrats! Correct username &password through promise resolve"
            );
          } else {
            reject(
              "your username and password are not correct through promise reject"
            );
          }
        })
        .catch(e => {
          reject("Error happens, please try again later.");
        });
    });
  }

  register() {
    return new Promise(async (resolve, reject) => {
      // Step #2: Only if there are no validation errors
      // then save the user data into a database.
      this.cleanUp();
      await this.validate();
      if (!this.errors.length) {
        // hash user password
        let salt = bcrypt.genSaltSync(10);
        this.data.password = bcrypt.hashSync(this.data.password, salt);
        await usersCollection.insertOne(this.data);
        this.getAvatar();
        resolve();
      } else {
        reject(this.errors);
      }
    });
  }

  getAvatar() {
    this.avatar = `https://gravatar.com/avatar/${md5(this.data.email)}?s=128`;
  }
}
//class User's data & its method above

User.findByUsername = username => {
  return new Promise((resolve, reject) => {
    if (typeof username != "string") {
      reject();
      return;
    }
    usersCollection
      .findOne({ username: username })
      .then(userDoc => {
        if (userDoc) {
          userDoc = new User(userDoc, true);
          userDoc = {
            _id: userDoc.data._id,
            username: userDoc.data.username,
            avatar: userDoc.avatar
          };
          resolve(userDoc);
        } else {
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};
module.exports = User;
