const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const KitSchema = new Schema({
  name: { type: String, required: true, maxLength: 50 },
  description: { type: String, required: true, maxLength: 200 },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  team: { type: Schema.Types.ObjectId, required: true, ref: "Team" },
  fileName: { type: String },
});

// Virtual for url
KitSchema.virtual("url").get(function () {
  return `/store/kit/${this._id}`;
});

module.exports = mongoose.model("Kit", KitSchema);
