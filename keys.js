require("dotenv").config();
module.exports = {
  MONGOURI: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zxfgl.mongodb.net/mainDatabase?retryWrites=true&w=majority`,
  JWT_SECRET: `${process.env.JWT_SECRET}`,
};
