const express = require("express");
const varifyToken = require("../middleWare/varifyToken");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");

router.get("/user/:id", varifyToken, (req, res) => {
  console.log(req.params.id);
  User.findOne({ _id: req.params.id })
    .select("-password")
    .then((user) => {
      Post.find({ postedBy: req.params.id })
        .populate("postedBy", "_id,name")
        .exec((err, posts) => {
          if (err) {
            return res.send({ message: "no post found" });
          }
          return res.send({ user, posts });
        });
    })
    .catch((err) => {
      return res.send({ err: "No user found" });
    });
});

// function for following
router.put("/follow", varifyToken, (req, res) => {
  //here followId is whom to follow
  User.findByIdAndUpdate(
    req.body.followID,
    {
      $push: { followers: req.user._id },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.send({ err });
      }

      User.findByIdAndUpdate(
        req.user._id,
        {
          $push: { followings: req.body.followID },
        },
        { new: true, upsert: true }
      )
        .select("-password")
        .then((result) => {
          res.send(result);
        });
    }
  );
});

// function for unfollowing
router.put("/unfollow", varifyToken, (req, res) => {
  //here followId is whom to follow
  User.findByIdAndUpdate(
    req.body.UnFollowID,
    {
      $pull: { followers: req.user._id },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.send({ err });
      }

      User.findByIdAndUpdate(
        req.user._id,
        {
          $pull: { followings: req.body.unFollowID },
        },
        { new: true, upsert: true }
      )
        .select("password")
        .then((result) => {
          res.send(result);
        });
    }
  );
});

module.exports = router;
