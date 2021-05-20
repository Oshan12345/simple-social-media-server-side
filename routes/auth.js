const express = require("express");
var bcrypt = require("bcryptjs");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleWare/varifyToken");
var nodemailer = require("nodemailer");
var sgTransport = require("nodemailer-sendgrid-transport");
const { JWT_SECRET } = require("../keys");
//crypto is build in feature of node
const crypto = require("crypto");

require("dotenv").config();
router.get("/home", (req, res) => {
  res.send("hello from home");
});

var mailer = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.EMAIL_KEY,
    },
  })
);

router.post("/signUp", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(422)
      .send({ message: "some field missing", isSignedUp: false });
  } else {
    User.findOne({ email: email })
      .then((savedUser) => {
        if (savedUser) {
          return res.status(422).send({
            message: "User already there with this email",
            isSignedUp: false,
          });
        }

        bcrypt.hash(password, 12).then((hashedPass) => {
          const user = new User({
            name,
            email,
            password: hashedPass,
          });

          user
            .save()
            .then((savedUser) => {
              var email = {
                to: savedUser.email,
                from: "mr.oshanbiswas@gmail.com",
                subject: "Hi there. You have successfully created your account",
                text: "Awesome sauce",
                html: "<b>Awesome sauce</b>",
              };

              mailer.sendMail(email, function (err, response) {
                if (err) {
                  console.log(err);
                }
                console.log(response);
              });

              const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
              res.send({
                id: savedUser._id,
                name: savedUser.name,
                email: savedUser.email,
                message: "Hurry, you have signed up successfully",
                isSignedUp: true,
                token,
              });
            })
            .catch((err) => console.log(err));
        });
      })
      .catch((err) => console.log(err));
  }
});

router.post("/logIn", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).send({
      message: "Please provide both email and password.",
      isLoggedIn: false,
    });
  }

  User.findOne({ email: email }).then((savedUser) => {
    if (!savedUser) {
      return res
        .status(422)
        .send({ message: "Invalid email or password", isLoggedIn: false });
    }
    bcrypt.compare(password, savedUser.password).then((response) => {
      if (response) {
        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);

        res.send({
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          message: "logged in successfully",
          isLoggedIn: true,
          token,
          followings: savedUser.followings,
          followers: savedUser.followers,
        });
      } else {
        res.send({ message: "Invalid email or password", isLoggedIn: false });
      }
    });
  });
});

router.post("/change-password", (req, res) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) console.log(err);

    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email }).then((user) => {
      if (!user) {
        res.send({ message: "No user is found with this email..." });
      } else {
        user.resetToken = token;
        user.expiredToken = Date.now() + 3600000;

        user.save().then((result) => {
          const email = {
            to: user.email,
            from: "mr.oshanbiswas@gmail.com",
            subject: "Password reset",
            //  text: "Awesome sauce",
            html: `<b>
                 You have requested for resetting your password. 
                 Click this link to reset. <a href="https://buddy-zone.vercel.app/reset/${token}">Reset password</a>
   
               </b>`,
          };

          mailer.sendMail(email, function (err, response) {
            if (err) {
              console.log(err);
            }
            console.log(response);
          });

          res.send({ message: `Check Your email.` });
        });
      }
    });
  });
});

router.put("/update-password", (req, res) => {
  const newPassword = req.body.newPassword;
  const token = req.body.resetToken;

  User.findOne({
    resetToken: token,
    expiredToken: { $gt: Date.now() },
  }).then((user) => {
    if (!user) {
      return res.send({ message: "Try again . the session has expired" });
    } else {
      bcrypt.hash(newPassword, 12).then((hashedPass) => {
        user.password = hashedPass;
        user.resetToken = undefined;
        user.expiredToken = undefined;

        user.save().then((result) => {
          res.send({ message: "Password has been updated successfully...." });
        });
      });
    }
  });
});

module.exports = router;
