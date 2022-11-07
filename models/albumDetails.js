const mongoose = require("mongoose");

const albumDetailsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  record_label: {
    type: String,
    required: true,
  },
  label_number: {
    type: String,
    required: true,
  },
  artists: {
    type: [String],
    required: true,
  },
  tags: {
    type: [String],
  },
});

module.exports = mongoose.model(
  "albumdetails",
  albumDetailsSchema,
  "allalbumdetails"
);
