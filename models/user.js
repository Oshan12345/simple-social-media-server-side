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
  profilePic: {
    type: String,
    default:
      "http://res.cloudinary.com/oshan/image/upload/v1620756009/q1gzdgvlw2pqoa7qnypf.png",
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
  resetToken: String,
  expiredToken: Date,
});

mongoose.model("User", userSchema);
