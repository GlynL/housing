const express = require("express");
const methodOverride = require("method-override");
const app = express();
const dotenv = require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");

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

app.get("/", (req, res) => res.render("index"));

app.get("/houses", (req, res) => {
  // query db for all houses - pass data to houses view
  House.find({})
    .then(houses => res.render("houses", { houses }))
    .catch(err => console.log(err));
});

app.get("/houses/new", (req, res) => res.render("new-house"));

app.post("/houses", upload.single("thumbnail"), function(req, res) {
  let newHouse = req.body;
  newHouse.thumbnail = {};
  newHouse.thumbnail.url = req.file.secure_url;
  newHouse.thumbnail.id = req.file.public_id;
  House.create(newHouse)
    // TODO: redirect to house page
    .then(() => res.redirect("/houses"))
    .catch(err => {
      console.log(err);
      res.redirect("/houses/new");
    });
});

app.get("/houses/:id", (req, res) => {
  House.findById(req.params.id)
    .then(house => {
      res.render("house-single", { house });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/houses");
    });
});

// EDIT ROUTE
app.get("/houses/:id/edit", (req, res) => {
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
app.put("/houses/:id", upload.single("thumbnail"), (req, res) => {
  let updateHouse = req.body;

  const file = req.file;

  if (req.file) {
    House.findById(req.params.id)
      .then(house => {
        // delete image from cloud server
        cloudinary.v2.api.delete_resources([house.thumbnail.id], {
          resource_type: "raw"
        });
      })
      .then(() => {
        // upload new image to cloud server
        cloudinary.v2.uploader
          // upload_stream w/ 'raw' is to work image uploads from buffer
          .upload_stream({ resource_type: "raw" }, (error, result) => {
            updateHouse.thumbnail = { url: null, id: null };
            updateHouse.thumbnail.url = result.secure_url;
            updateHouse.thumbnail.id = result.public_id;
            updateHouseDb(updateHouse);
          })
          .end(req.file.buffer);
      })
      .catch(err => {
        console.log(err);
        res.redirect("/");
      });
  } else updateHouseDb(updateHouse);

  function updateHouseDb(house) {
    House.findByIdAndUpdate(req.params.id, house)
      .then(() => res.redirect(`/houses/${req.params.id}`))
      .catch(err => {
        console.log(err);
        res.redirect("/");
      });
  }
});

app.delete("/houses/:id", (req, res) => {
  const id = req.params.id;
  House.findById(id)
    .then(house => {
      cloudinary.v2.api.delete_resources(
        [house.thumbnail.id],
        { resource_type: "raw" },
        function(err, result) {
          if (err) throw new error();
          House.removeById(id)
            .then(() => res.json({ status: true, url: "/" }))
            .catch(err => console.log(err));
        }
      );
    })
    .catch(err => console.log(err));
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
