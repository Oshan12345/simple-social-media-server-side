const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../keys");
const mongoose = require("mongoose");
const User = mongoose.model("User");
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(authorization);
  if (!authorization) {
    return res.send({ message: "User must be logged in" });
  }

  const token = authorization.replace("Bearer ", "");
  jwt.verify(token, JWT_SECRET, function (err, decoded) {
    if (err) {
      return res.send({ message: "Please sign in." });
    }

    // console.log(decoded); // bar
    const { _id } = decoded;
    //  console.log(_id);
    User.findById(_id).then((userData) => {
      // console.log("sssssaaaammm", req);
      req.user = userData;

      console.log("helllllllllllllllllloooooooooooooo-", userData);
      //  console.log("divya", req.user);
      next();
    });
  });
};
