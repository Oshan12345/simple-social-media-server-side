const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  followers: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
  followings: [
    {
      type: ObjectId,
      ref: "User",
    },
  ],
});

mongoose.model("User", userSchema);
