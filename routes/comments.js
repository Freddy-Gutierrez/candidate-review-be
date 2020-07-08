const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const _ = require("lodash");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { Candidate } = require("../models/candidate");

// return candidate of given id
router.get("/:id", async (req, res) => {
  const candidate = await Candidate.isValidCandidate(req.params.id);
  if (!candidate) return res.status(404).send("Candidate not found");
  res.status(200).send(candidate);
});

// add comment to corresponding candidate if user is logged in and hasn't commented yet
router.post("/:id", [auth, validate(validateComment)], async (req, res) => {
  const { name, rating, comment } = req.body;
  const candidate = await Candidate.isValidCandidate(req.params.id);
  if (!candidate) return res.status(404).send("Candidate not found");

  for (let comment of candidate.comments)
    if (String(req.user._id) === String(comment.userId))
      return res.status(403).send("user may only comment once per candidate");

  candidate.comments.push({ userId: req.user._id, name, rating, comment });

  await candidate.save();

  res.status(200).send(candidate);
});

// update a user comment on a candidate
router.put("/:id", [auth, validate(validateComment)], async (req, res) => {
  const { rating, comment: com } = req.body;
  const candidate = await Candidate.isValidCandidate(req.params.id);
  if (!candidate) return res.status(404).send("Candidate not found");

  for (let comment of candidate.comments) {
    if (String(req.user._id) === String(comment.userId)) {
      comment.set({
        rating,
        comment: com,
        date: Date.now(),
      });
      await candidate.save();
      return res.status(200).send(candidate);
    }
  }
  return res.status(404).send("User has not posted a comment yet");
});

function validateComment(comment) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(20).required(),
    rating: Joi.number().required(),
    comment: Joi.string().min(5).max(500).required(),
  });
  return schema.validate(comment);
}

module.exports = router;
