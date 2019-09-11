const usersCollection = require("../db").collection("users");

const validator = require("validator");
class User {
  constructor(data) {
    this.data = data;
    this.errors = [];
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
      this.errors.push("Your username can only contains letters and numbers.");
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
  }

  login(callback) {
    this.cleanUp();
    usersCollection.findOne(
      { username: this.data.username },
      (err, attemptedUser) => {
        if (attemptedUser && attemptedUser.password == this.data.password) {
          callback("correct username &password");
        } else {
          callback("your username and password are correct");
        }
      }
    );
  }

  register() {
    // Step #2: Only if there are no validation errors
    // then save the user data into a database.
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      usersCollection.insertOne(this.data);
    }
  }
}

module.exports = User;
