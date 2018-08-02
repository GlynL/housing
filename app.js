const express = require("express");
const methodOverride = require("method-override");
const app = express();
const dotenv = require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
const houseControllers = require("./controllers/houses");

const PORT = process.env.PORT;
const House = require("./models/House");

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

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "houses",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
});

const upload = multer({ storage: storage });

app.get("/", houseControllers.home);

app.get("/houses", houseControllers.houses);

app.get("/houses/new", houseControllers.new);

app.post(
  "/houses",
  // upload images to cloudinary
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1
    },
    {
      name: "gallery",
      maxCount: 10
    }
  ]),
  houseControllers.add
);

app.get("/houses/:id", houseControllers.single);

// EDIT ROUTE
app.get("/houses/:id/edit", (req, res) => {
  // locate house by id in DB & render edit-page
  House.findById(req.params.id)
    .then(house => {
      res.render("house-edit", { house });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/houses");
    });
});

// UPDATE ROUTE
app.put(
  "/houses/:id",
  upload.fields([
    {
      name: "thumbnail",
      maxCount: 1
    },
    {
      name: "gallery",
      maxCount: 10
    }
  ]),
  houseControllers.edit
);

app.delete("/houses/:id", houseControllers.delete);

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
