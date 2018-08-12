const mongoose = require("mongoose");
mongoose.set("debug", true);

mongoose.connect("mongodb://localhost/housing");
mongoose.promise = Promise;
const db = mongoose.connection;

const Schema = mongoose.Schema;
const houseSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
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
    bedrooms: {
      type: Number,
      required: true
    },
    bathrooms: {
      type: Number,
      required: true
    },
    features: Array
  },
  { minimize: false }
);

const House = mongoose.model("House", houseSchema);

module.exports = House;
