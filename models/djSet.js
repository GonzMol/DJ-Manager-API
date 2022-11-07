const mongoose = require("mongoose");
const { Schema } = mongoose;
const djSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  creator: {
    type: String,
    required: true,
  },
  is_published: {
    type: Boolean,
    required: true,
  },
  tags: {
    type: [String],
  },
  songs: {
    type: [{ type: Schema.Types.ObjectId, ref: "song" }],
    required: true,
  },
});

module.exports = mongoose.model("djset", djSetSchema, "djsets");
