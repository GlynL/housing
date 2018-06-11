const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const cloudinary = require("cloudinary");

const PORT = process.env.PORT;
const House = require("./models/House");

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

app.get("/", (req, res) => res.render("index"));

app.get("/houses", (req, res) => {
  // query db for all houses - pass data to houses view
  House.find({}).then(houses => res.render("houses", { houses }));
});

app.get("/houses-new", (req, res) => res.render("new-house"));

// TODO: force uniform size for image upload

app.post("/houses", upload.single("thumbnail"), function(req, res) {
  let newHouse = req.body;
  // access image upload - save in mem storage (multer) - upload to cloudinary
  cloudinary.v2.uploader
    // upload_stream w/ 'raw' is to work image uploads from buffer
    .upload_stream({ resource_type: "raw" }, (err, result) => {
      newHouse.thumbnail = result.secure_url;
      House.create(newHouse).then(newHouse => res.redirect("/houses"));
    })
    .end(req.file.buffer);
});

app.get("/houses/:id", (req, res) => {
  House.find({ _id: req.params.id }).then(house => {
    res.render("house-single", { house });
  });
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
