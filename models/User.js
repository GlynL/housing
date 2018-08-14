const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const userSchema = new Schema({
  email: {
    type: String
  },
  password: {
    type: String
  }
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: "email"
});

const User = mongoose.model("User", userSchema);

module.exports = User;
