const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const _ = require("lodash");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Candidate } = require("../models/candidate");

// return all candidates
router.get("/", async (req, res) => {
  const candidates = await Candidate.find().select("-comments -rating");
  res.status(200).send(candidates);
});

// if user is logged in, and an admin, and valid candidate id is provided
// return candidate info
router.get("/:id", [auth, admin], async (req, res) => {
  const candidate = await Candidate.isValidCandidate(req.params.id);
  if (!candidate) return res.status(404).send("Candidate not found");

  res
    .status(200)
    .send(_.pick(candidate, ["_id", "name", "specialties", "presentation"]));
});

// if user is logged in, and an admin, add new candidate
router.post(
  "/",
  [auth, admin, validate(validateCandidate)],
  async (req, res) => {
    const { name, specialties, presentation } = req.body;
    const candidate = await new Candidate({
      name,
      specialties,
      presentation,
    });
    await candidate.save();
    res
      .status(200)
      .send(_.pick(candidate, ["_id", "name", "specialties", "presentation"]));
  }
);

// if user is logged in, and an admin, and valid candidate id is provided
// update target candidate info
router.put(
  "/:id",
  [auth, admin, validate(validateCandidate)],
  async (req, res) => {
    const { name, specialties, presentation } = req.body;

    const candidate = await Candidate.isValidCandidate(req.params.id);
    if (!candidate) return res.status(404).send("Candidate not found");

    candidate.set({
      name,
      specialties,
      presentation,
    });

    await candidate.save();

    res
      .status(200)
      .send(_.pick(candidate, ["_id", "name", "specialties", "presentation"]));
  }
);

function validateCandidate(candidate) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(20).required(),
    specialties: Joi.string().min(10).max(255).required(),
    presentation: Joi.string().min(10).max(30).required(),
  });
  return schema.validate(candidate);
}

module.exports = router;
