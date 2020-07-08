const users = require("../routes/users");
const candidates = require("../routes/candidates");
const comments = require("../routes/comments");
const error = require("../middleware/error");
const express = require("express");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/candidates", candidates);
  app.use("/api/comments", comments);
  app.use(error);
};
