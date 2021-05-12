const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const postSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    likedBy: [
      {
        type: ObjectId,
        ref: "User",
      },
    ],
    postedBy: {
      type: ObjectId,
      ref: "User",
    },
    comments: [
      {
        commentText: String,
        commentBy: {
          type: ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// title: {
//   type: String,
//   required: true,
// },
//to establish relation between to model we can use ref. here type :ObjectedId refer to id of User table.
mongoose.model("Post", postSchema);
