const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, required: true, maxLength: 30 },
  description: { type: String, required: true, maxLength: 200 },
  league: { type: Schema.Types.ObjectId, required: true, ref: "League" },
  fileName: { type: String },
});

// Virtual for url
TeamSchema.virtual("url").get(function () {
  return `/store/team/${this._id}`;
});

module.exports = mongoose.model("Team", TeamSchema);
