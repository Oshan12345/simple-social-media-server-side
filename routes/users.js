const express = require("express");
const varifyToken = require("../middleWare/varifyToken");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Post = mongoose.model("Post");

router.get("/all-users", varifyToken, (req, res) => {
  console.log("sssssssssssssssssssssssssssssssssssssss", req.user._id);
  User.find({ _id: { $ne: req.user._id } })
    .select("-password")
    .then((result) => {
      res.send({ result });
    });
});

router.get("/user/:id", varifyToken, (req, res) => {
  // console.log(req.params.id);
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

//
// db.inventory.update(
//   { _id: 2 },
//   { $addToSet: { tags: { $each: ["camera", "electronics", "accessories"] } } }
// );
//

// function for following
router.put("/follow", varifyToken, (req, res) => {
  User.findByIdAndUpdate(
    req.body.followID,
    {
      $addToSet: { followers: { $each: [req.user._id] } },
    },
    { new: true },
    (err, result) => {
      if (err) {
        return res.send({ err });
      }
      //   console.log("ssssssssssssssssssssssssssss----------------------", result);
      User.findByIdAndUpdate(
        req.user._id,
        {
          $addToSet: { followings: { $each: [req.body.followID] } },
        },
        { new: true, upsert: true }
      )
        .select("-password")
        .then((result) => {
          res.send(result);
        });
    }
  );

  //here followId is whom to follow
  // User.findByIdAndUpdate(
  //   req.body.followID,
  //   {
  //     $push: { followers: req.user._id },
  //   },
  //   { new: true },
  //   (err, result) => {
  //     if (err) {
  //       return res.send({ err });
  //     }

  //     User.findByIdAndUpdate(
  //       req.user._id,
  //       {
  //         $push: { followings: req.body.followID },
  //       },
  //       { new: true, upsert: true }
  //     )
  //       .select("-password")
  //       .then((result) => {
  //         res.send(result);
  //       });
  //   }
  // );
});

// function for unfollowing
router.put("/unfollow", varifyToken, (req, res) => {
  //here followId is whom to follow
  //  console.log("ssssssssssssssss-", req.body.unFollowID);
  User.findByIdAndUpdate(
    req.body.unFollowID,
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
        .select("-password")
        .then((result) => {
          //    console.log("ssssssssssssssssssssssss----", req.body.unFollowID);
          res.send(result);
        });
    }
  );
});

router.put("/update-profile-pic", varifyToken, (req, res) => {
  // console.log("req.user._id", req.user._id);
  // console.log("body", req.body);
  User.findByIdAndUpdate(req.user._id, { profilePic: req.body.imageUrl }).exec(
    function (err, response) {
      if (response) {
        res.send(response);
      } else {
        res.send(err);
      }
    }
  );
});

module.exports = router;
