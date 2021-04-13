const express = require("express");
var bcrypt = require("bcryptjs");
const router = express.Router();
const mongoose = require("mongoose");
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleWare/varifyToken");
const { JWT_SECRET } = require("../keys");
router.get("/home", (req, res) => {
  res.send("hello from home");
});

bcrypt.hash("bacon", 8).then((res) => console.log("sagar-", res));

router.get("/blog", verifyToken, (req, res) => {
  res.send("hello from blog");
});
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
    console.log(savedUser);
    if (!savedUser) {
      return res
        .status(422)
        .send({ message: "Invalid email or password", isLoggedIn: false });
    }
    bcrypt.compare(password, savedUser.password).then((response) => {
      console.log(response);

      if (response) {
        const token = jwt.sign({ _id: savedUser._id }, JWT_SECRET);
        // console.log(token);
        //  console.log(response);
        res.send({
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          message: "logged in successfully",
          isLoggedIn: true,
          token,
        });
      } else {
        res.send({ message: "Invalid email or password", isLoggedIn: false });
      }
    });
  });
});
module.exports = router;
