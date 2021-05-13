const express = require("express");
const varifyToken = require("../middleWare/varifyToken");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");
const Chat = mongoose.model("Chat");
const Pusher = require("pusher");
require("dotenv").config();

const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER,
  useTLS: true,
});

//working code
// router.get("/following-list/:userId", varifyToken, (req, res) => {
//   const id = req.params.userId;
//
//   User.find(mongoose.Types.ObjectId(id))
//     .select("followings , _id")
//     .populate("followings", "_id name")
//     .then((result) => {
//       res.send(result[0]);
//     });
// });

router.get("/following-list/:userId", (req, res) => {
  const id = req.params.userId;

  let whomToChat;
  User.find(mongoose.Types.ObjectId(id))
    .select("followings , _id")
    .populate("followings", "_id name profilePic")
    .then((result) => {
      const followings = result[0];

      whomToChat = [...followings.followings];

      Chat.find({ receiver: mongoose.Types.ObjectId(id) })
        .populate("sender", "_id name profilePic")

        .then((anotherResponse) => {
          const x = anotherResponse.map((x) => x.sender);
          whomToChat = [...whomToChat, ...x];
          res.send(whomToChat);
        });
    });
});

router.get("/follower-list/:userId", (req, res) => {
  const id = req.params.userId;
  User.find(mongoose.Types.ObjectId(id))
    .select("followers, _id")
    .populate("followers", "_id name")
    .then((result) => {
      res.send(result);
    });
});

router.get("/create-chat/:senderId/:receiverId", (req, res) => {
  const sender = req.params.senderId;
  const receiver = req.params.receiverId;

  Chat.find({
    sender: mongoose.Types.ObjectId(sender),
    receiver: mongoose.Types.ObjectId(receiver),
  })
    .populate("messages.sendBy", "_id name")
    .then((response) => {
      if (response.length) {
        const responseObj = response[0];
        return res.send({
          message: "there is already a chat collection with this user",
          responseObj,
        });
      }

      Chat.find({
        sender: mongoose.Types.ObjectId(receiver),
        receiver: mongoose.Types.ObjectId(sender),
      })
        .populate("messages.sendBy", "_id name")
        .then((secondRes) => {
          if (secondRes.length) {
            const responseObj = secondRes[0];
            return res.send({
              message: "there is already a chat collection with this user",
              responseObj,
            });
          }
          if (!secondRes.length) {
            const chat = new Chat({
              sender,
              receiver,
            });

            chat.save().then((response) =>
              res.send({
                message: "New chat has been created",
                responseObj: response,
              })
            );
          }
        });
    });
});

router.put("/continue-chat", varifyToken, (req, res) => {
  const chatId = req.body.chatId;
  const message = {
    chatText: req.body.message,
    sendBy: req.user._id,
  };

  Chat.findByIdAndUpdate(
    chatId,
    { $push: { messages: message } },
    { new: true, upsert: true }
  )
    .populate("messages.sendBy", "_id name")
    .then((result) => {
      pusher.trigger("Chats", "my-chats", {
        ...result,
      });

      res.json(result);
    });
});

module.exports = router;
