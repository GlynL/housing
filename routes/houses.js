const express = require("express");
const router = express.Router();
const houseControllers = require("../controllers/houses");
const House = require("../models/House");
const cloudinary = require("cloudinary");
const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");
const isAuthed = require("../middleware/auth");
const userMatch = require("../middleware/userMatch");

// setup storage with options and transformations
const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "houses",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
});

// setup multer to parse our storage choices
const parser = multer({ storage: storage });

router.get("/", houseControllers.houses);

router.get("/new", isAuthed, houseControllers.new);

router.post(
  "/",
  // upload images to cloudinary
  parser.fields([
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

router.get("/:id", houseControllers.single);

// EDIT ROUTE
router.get("/:id/edit", userMatch, (req, res) => {
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
router.put(
  "/:id",
  userMatch,
  parser.fields([
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

// delete image from gallery
router.delete("/:id/gallery", userMatch, houseControllers.deleteGallery);

// delete property
router.delete("/:id", userMatch, houseControllers.delete);

// send email enquiry
router.post("/:id/enquire", isAuthed, houseControllers.enquire);

module.exports = router;
