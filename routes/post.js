const express = require("express");
const varifyToken = require("../middleWare/varifyToken");
const router = express.Router();
const mongoose = require("mongoose");
const Post = mongoose.model("Post");
router.post("/make-post", varifyToken, (req, res) => {
  const { body, photo } = req.body;

  if (!body) {
    return res.send({ message: "please fill all the fields." });
  }
  req.user.password = undefined;

  const post = new Post({
    body,
    photo,
    postedBy: req.user,
    likedBy: [],
  });
  post.save().then((result) => {
    res.send({ result });
  });
});

router.get("/get-posts", varifyToken, (req, res) => {
  Post.find({})
    .populate("postedBy", "_id name")
    .populate("comments.commentBy", "_id name")
    .sort("-createdAt")
    .then((result) => {
      res.send({ result });
    });
});

router.get("/get-followings-post", varifyToken, (req, res) => {
  Post.find({ postedBy: { $in: req.user.followings } })
    .populate("postedBy", "_id name")
    .populate("comments.commentBy", "_id name")
    .sort("-createdAt")
    .then((result) => {
      res.send({ result });
    });
});

router.get("/my-post", varifyToken, (req, res) => {
  Post.find({ postedBy: req.user._id })
    .populate("postedBy", "_id name")
    .then((result) => {
      res.json({ result });
    });
});

router.put("/like-post", varifyToken, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $push: { likedBy: req.user._id } },
    { new: true, upsert: true }
  ).exec(function (err, response) {
    if (err) {
      return res.send({ err });
    } else {
      return res.send(response);
    }
  });
});

router.put("/unlike-post", varifyToken, (req, res) => {
  Post.findByIdAndUpdate(
    req.body.postId,
    { $pull: { likedBy: req.user._id } },
    { new: true, upsert: true }
  ).exec(function (err, response) {
    if (err) {
      return res.send({ err });
    } else {
      return res.send(response);
    }
  });
});

router.put("/comment-to-post", varifyToken, (req, res) => {
  const postId = req.body.postId;
  const comment = {
    commentText: req.body.comment,
    commentBy: req.user._id,
  };

  Post.findByIdAndUpdate(
    postId,
    { $push: { comments: comment } },
    { new: true, upsert: true }
  )
    .populate("comments.commentBy", "_id name")
    .then((result) => {
      res.json(result);
    });
});

//delete post
router.delete("/delete-my-post/:postId", varifyToken, (req, res) => {
  const postId = req.params.postId;

  Post.findOne(mongoose.Types.ObjectId(postId))
    .populate("postedBy", "_id")
    .exec((err, document) => {
      if (err || !document) {
        return res.send({ message: "no post available" });
      }

      const x = {
        postedBy: document.postedBy._id,
        userId: req.user._id,
      };

      if (document.postedBy._id.toString() === req.user._id.toString()) {
        Post.deleteOne({ _id: postId }).then((result) => {
          return res.send({ message: "Deleted successfully" });
        });
      } else {
        res.send({ message: "You can't delete it" });
      }
    });
});

module.exports = router;
