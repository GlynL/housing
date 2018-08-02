const express = require("express");
const router = express.Router();
const houseControllers = require("../controllers/houses");
const House = require("../models/House");
const cloudinary = require("cloudinary");
const multer = require("multer");
const cloudinaryStorage = require("multer-storage-cloudinary");

const storage = cloudinaryStorage({
  cloudinary: cloudinary,
  folder: "houses",
  allowedFormats: ["jpg", "png"],
  transformation: [{ width: 500, height: 500, crop: "limit" }]
});

const upload = multer({ storage: storage });

router.get("/", houseControllers.houses);

router.get("/new", houseControllers.new);

router.post(
  "/",
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

router.get("/:id", houseControllers.single);

// EDIT ROUTE
router.get("/:id/edit", (req, res) => {
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

router.delete("/:id", houseControllers.delete);

module.exports = router;
