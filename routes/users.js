const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");

// add new user
router.post("/", validate(validateUser), async (req, res) => {
  const { username, password } = req.body;
  const isAdmin = username === "freddyg" ? true : false;

  let user = await User.findOne({ username: username });
  if (user) return res.status(400).send("User already registered");

  user = await new User({
    username: username,
    password: password,
    isAdmin: isAdmin,
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "username", "isAdmin"]));
});

// get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.send(users);
});

// authenticate user, then send user info to client
router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.status(200).send(user);
});

// validate user using hapi/joi
function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(5).max(20).required(),
    password: Joi.string().min(5).max(20).required(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

module.exports = router;
