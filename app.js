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
// pusher stuff

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1195694",
  key: "400843c3e3c79864883e",
  secret: "2f5e5a26b7a15cda905a",
  cluster: "mt1",
  useTLS: true,
});

// const msgCollection = mongoose.connection.collection("Chat");
// const changeStream = msgCollection.watch()
// changeStream.on('change',(change)=>{
//   console.log(change)
// })

mongoose.connection.once("open", () => {
  console.log("helloooo");

  //pusher
  const msgCollection = mongoose.connection.collection("Chats");
  const changeStream = msgCollection.watch();
  console.log("ssssssss-------------------->", changeStream.on);
  changeStream.on("change", (change) => {
    console.log("dipa-------------------->", change);
  });
  //pusher
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
app.listen(port);
