const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const cors = require("cors");
const mongoose = require("mongoose");
const { MONGOURI } = require("./keys");

app.use(express.json());

mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

//end of pusher
mongoose.connection.on("connected", () => {
  console.log("connected to db successfully");
});

mongoose.connection.on("error", (err) => {
  console.log("showing error-", err);
});
app.get("/", (req, res) => {
  res.send("hello");
});

require("./models/user");
require("./models/post");
require("./models/chats");
app.use(require("./routes/auth"));
app.use(require("./routes/post"));
app.use(require("./routes/users"));
app.use(require("./routes/chats"));
app.use(require("./routes/search"));

app.get("/hello", (req, res) => {
  res.send("hello world.");
});
app.listen(port);
