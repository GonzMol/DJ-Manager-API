const mongoose = require("mongoose");
const { Schema } = mongoose;

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artists: {
    type: [String],
    required: true,
  },
  album_id: {
    type: Schema.Types.ObjectId,
    ref: "albumdetails",
    required: true,
  },
});

/* 
The first argument is the singular name of the collection your model is for. 
Mongoose automatically looks for the plural, lowercased version of your 
model name. Thus, if we don't specify the third argument, Mongoose will
still go for songs. If we name the first argument as something else, then 
it is necessary to give a correct third argument.
*/

module.exports = mongoose.model("song", songSchema, "songs");
