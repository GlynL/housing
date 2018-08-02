const express = require("express");
const methodOverride = require("method-override");
const app = express();
const dotenv = require("dotenv").config();
const cloudinary = require("cloudinary");
const houseRoutes = require("./routes/houses");

const PORT = process.env.PORT;

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

app.use(methodOverride("_method"));

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.get("/", (req, res) => res.render("index", { page_name: "home" }));

app.use("/houses", houseRoutes);

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
