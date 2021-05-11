const express = require("express");
const varifyToken = require("../middleWare/varifyToken");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");
const Chat = mongoose.model("Chat");
const Pusher = require("pusher");
require("dotenv").config();
console.log(
  "sssssssssss-> ",
  process.env.APP_ID,
  process.env.KEY,
  process.env.SECRET,
  process.env.CLUSTER
);
const pusher = new Pusher({
  appId: process.env.APP_ID,
  key: process.env.KEY,
  secret: process.env.SECRET,
  cluster: process.env.CLUSTER,
  useTLS: true,
});
// router.get("/following-list", (req, res) => {
//   User.find({})
//     .select("followings , _id")
//     .populate("followings", "_id name")
//     .then((result) => {
//       res.send(result);
//     });
// });
//working code
// router.get("/following-list/:userId", varifyToken, (req, res) => {
//   const id = req.params.userId;
//   // console.log(id);
//   User.find(mongoose.Types.ObjectId(id))
//     .select("followings , _id")
//     .populate("followings", "_id name")
//     .then((result) => {
//       res.send(result[0]);
//     });
// });

router.get("/following-list/:userId", (req, res) => {
  const id = req.params.userId;
  // console.log(id);
  let whomToChat;
  User.find(mongoose.Types.ObjectId(id))
    .select("followings , _id")
    .populate("followings", "_id name profilePic")
    .then((result) => {
      const followings = result[0];
      //   console.log("sam---------------", followings);
      const newToChat = followings[0];
      whomToChat = [...followings.followings];
      // console.log("hey--", followings);
      // console.log("before", whomToChat);
      Chat.find({ receiver: mongoose.Types.ObjectId(id) })
        .populate("sender", "_id name profilePic")

        .then((anotherResponse) => {
          // console.log("sssssssssssssssssssss-------", anotherResponse);
          // if (anotherResponse.length) {
          //   const newToChat = anotherResponse.sender;
          //   console.log("new to chat---------", newToChat);
          //   whomToChat = [...whomToChat, newToChat];

          //   whomToChat.push(anotherResponse.sender);
          // }

          // console.log("whomToChat--------", whomToChat);
          const x = anotherResponse.map((x) => x.sender);
          whomToChat = [...whomToChat, ...x];
          res.send(whomToChat);
        });
    });
  // console.log(whomToChat);
});

// router.get("/follower-list", (req, res) => {
//   User.find({})
//     .select("followers , _id")
//     .populate("followers", "_id name")
//     .then((result) => {
//       res.send(result);
//     });
// });

router.get("/follower-list/:userId", (req, res) => {
  const id = req.params.userId;
  //  console.log(id);
  User.find(mongoose.Types.ObjectId(id))
    .select("followers, _id")
    .populate("followers", "_id name")
    .then((result) => {
      res.send(result);
    });
});
//this route is for checking if any one send me a message .
// router.get("/check-received-message", varifyToken, (req, res) => {
//   const receiver = req.params.receiverId;
//   Chat.find({ receiver: mongoose.Types.ObjectId(req.user._id) })
//     .populate("sender", "_id, name")
//     .then((response) => {
//       console.log("hello -------", response);
//       res.send(response);
//     });
// });

// router.get("/create-chat/:senderId/:receiverId", (req, res) => {
//   const sender = req.params.senderId;
//   const receiver = req.params.receiverId;
//   console.log({ sender, receiver });
//   // Chat.find({
//   //   sender:
//   //     mongoose.Types.ObjectId(sender) || mongoose.Types.ObjectId(receiver),
//   //   receiver:
//   //     mongoose.Types.ObjectId(receiver) || mongoose.Types.ObjectId(sender),
//   // })

//   Chat.find(
//     {
//       sender: mongoose.Types.ObjectId(sender),
//       receiver: mongoose.Types.ObjectId(receiver),
//     }
//   ).then((response) => {
//     console.log("hey sagar here is the response", response);
//     //
//     if (response.length) {
//       const responseObj = response[0];
//       return res.send({
//         message: "there is already a chat collection with this user",
//         responseObj,
//       });
//     }

//     if (!response.length) {
//       const chat = new Chat({
//         sender,
//         receiver,
//       });

//       chat.save().then((response) =>
//         res.send({
//           message: "New chat has been created",
//           responseObj: response,
//         })
//       );
//     }

//     //
//   });
// });
// new experimental code

router.get("/create-chat/:senderId/:receiverId", (req, res) => {
  const sender = req.params.senderId;
  const receiver = req.params.receiverId;
  // console.log({ sender, receiver });
  // Chat.find({
  //   sender:
  //     mongoose.Types.ObjectId(sender) || mongoose.Types.ObjectId(receiver),
  //   receiver:
  //     mongoose.Types.ObjectId(receiver) || mongoose.Types.ObjectId(sender),
  // })

  Chat.find({
    sender: mongoose.Types.ObjectId(sender),
    receiver: mongoose.Types.ObjectId(receiver),
  })
    .populate("messages.sendBy", "_id name")
    .then((response) => {
      // console.log("hey sagar here is the response", response);
      //
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

      //
    });
});
//end of experimental code
//get a chat with specific one

// router.get("/get-chat/:senderId/:receiverId", (req, res) => {
//   const sender = req.params.senderId;
//   const receiver = req.params.receiverId;
//   console.log({ receiver });
//   Chat.find({
//     sender: mongoose.Types.ObjectId(sender),
//     receiver: mongoose.Types.ObjectId(receiver),
//   }).then((response) => res.send(response));
// });

// protome condition er upor base kore ekta post reqent dibo...thenbar bar put req ta jabe
//ekhane protita chat k id diye alada detect kora lagbe.then oi chat tai continue korbo...
router.put("/continue-chat", varifyToken, (req, res) => {
  const chatId = req.body.chatId;
  const message = {
    chatText: req.body.message,
    sendBy: req.user._id,
  };
  // console.log("chatId", chatId);
  //console.log(message);
  Chat.findByIdAndUpdate(
    chatId,
    { $push: { messages: message } },
    { new: true, upsert: true }
  )
    .populate("messages.sendBy", "_id name")
    .then((result) => {
      //Pusher

      console.log(result);
      pusher.trigger("Chats", "my-chats", {
        ...result,
      });

      //pusher
      console.log(JSON.stringify(result));
      res.json(result);
    });
});

module.exports = router;
