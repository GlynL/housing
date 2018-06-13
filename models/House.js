const mongoose = require("mongoose");
mongoose.set("debug", true);

mongoose.connect("mongodb://localhost/housing");
mongoose.promise = Promise;
const db = mongoose.connection;

const Schema = mongoose.Schema;
const houseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  thumbnail: {
    url: {
      type: String
    },
    id: {
      type: String
    }
  },
  gallery: {
    type: Object
  },
  email: {
    type: String,
    required: true
  }
});

const House = mongoose.model("House", houseSchema);

module.exports = House;
