const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const LeagueSchema = new Schema({
  name: { type: String, required: true, maxLength: 20 },
  description: { type: String, required: true, maxLength: 200 },
});

// Virtual for url
LeagueSchema.virtual("url").get(function () {
  return `/store/league/${this._id}`;
});

module.exports = mongoose.model("League", LeagueSchema);
