const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

mongoose.set("debug", true);

mongoose.connect("mongodb://localhost/housing");
mongoose.promise = Promise;
const db = mongoose.connection;

const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String
  },
  password: {
    type: String
  }
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

module.exports = User;
