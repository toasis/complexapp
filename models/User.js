const validator = require("validator");
class User {
  constructor(data) {
    this.data = data;
    this.errors = [];
  }

  validate() {
    //Step #1 :validate user data

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
    }
  }

  register() {
    // Step #2: Only if there are no validation errors
    // then save the user data into a database.
    this.validate();
  }
}

module.exports = User;
