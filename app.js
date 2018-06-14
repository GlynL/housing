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

app.post(
  "/houses",
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
  (req, res) => {
    let newHouse = req.body;
    newHouse.thumbnail = {};
    newHouse.thumbnail.url = req.files.thumbnail[0].secure_url;
    newHouse.thumbnail.id = req.files.thumbnail[0].public_id;
    if (req.files.gallery) {
      newHouse.gallery = {};
      req.files.gallery.forEach(image => {
        newHouse.gallery[image.public_id] = image.secure_url;
      });
    }

    House.create(newHouse)
      // TODO: redirect to house page
      .then(() => res.redirect("/houses"))
      .catch(err => {
        console.log(err);
        res.redirect("/houses/new");
      });
  }
);

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
  (req, res) => {
    let updateHouse = req.body;

    if (req.files) {
      House.findById(req.params.id)
        .then(house => {
          // delete image from cloud server
          if (req.files.thumbnail) {
            cloudinary.v2.uploader.destroy(house.thumbnail.id);
            updateHouse.thumbnail = { url: null, id: null };
            updateHouse.thumbnail.url = req.files.thumbnail[0].secure_url;
            updateHouse.thumbnail.id = req.files.thumbnail[0].public_id;
          }
          if (req.files.gallery) {
            updateHouse.gallery = house.gallery || {};
            req.files.gallery.forEach(image => {
              updateHouse.gallery[image.public_id] = image.secure_url;
            });
          }
        })
        .then(() => {
          updateHouseDb(updateHouse);
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
  }
);

app.delete("/houses/:id", (req, res) => {
  const houseId = req.params.id;
  const galleryId = req.body.galleryId;
  cloudinary.v2.uploader.destroy(galleryId, function() {
    House.findById;
    House.findById(houseId)
      .then(house => {
        delete house.gallery[galleryId];
        House.findByIdAndUpdate(houseId, house)
          .then(result => res.json({ status: true, house: result }))
          .catch(err => console.log(err));
      })
      .catch(err => {
        console.log(err);
      });
  });
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
