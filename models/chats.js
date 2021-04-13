const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = mongoose.Schema.Types;
const chatSchema = new Schema({
  sender: {
    type: ObjectId,
    ref: "User",
  },
  receiver: {
    type: ObjectId,
    ref: "User",
  },
  messages: [
    {
      chatText: String,
      sendBy: {
        type: ObjectId,
        ref: "User",
      },
    },
  ],
});
//to establish relation between to model we can use ref. here type :ObjectedId refer to id of User table.
mongoose.model("Chat", chatSchema);
