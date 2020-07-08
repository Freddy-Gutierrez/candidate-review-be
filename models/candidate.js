const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId },
  name: { type: String, required: true, trim: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true, trim: true, lowercase: true },
  date: { type: Date, default: Date.now },
});

const candidateSchema = mongoose.Schema({
  name: { type: String, required: true, maxLength: 255, minLength: 3 },
  specialties: { type: String, required: true, maxLength: 255, minLength: 10 },
  presentation: { type: String, minLength: 10, maxLength: 30, required: true },
  operation: { type: String, default: "Edit" },
  rating: { type: String, default: "N/A" },
  comments: [commentSchema],
});

// static function that checks if candidate exists in DB
candidateSchema.statics.isValidCandidate = function (id) {
  return this.findById(id).select("-operation");
};

const Candidate = mongoose.model("Candidate", candidateSchema);

exports.Candidate = Candidate;
