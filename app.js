const express = require("express");
const app = express();
const port = 4000;
const cors = require("cors");
const mongoose = require("mongoose");
const { MONGOURI } = require("./keys");
require("dotenv").config();

app.use(express.json());

//app.use(cors());
//app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGOURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});

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
app.listen(port);
