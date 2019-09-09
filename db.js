const mongodb = require("mongodb");
const connectionString =
  "mongodb+srv://ToDoApp-user1:123456a@cluster0-v8qpu.mongodb.net/complexApp?retryWrites=true&w=majority";

mongodb.connect(
  connectionString,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, client) => {
    module.exports = client.db();
    const app = require("./app");
    app.listen(3002);
  }
);
