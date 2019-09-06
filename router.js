console.log("router.js is executed immediately.");

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("home-guest");
});

module.exports = router;
