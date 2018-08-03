const House = require("../models/House");
const cloudinary = require("cloudinary");

exports.houses = (req, res, next) => {
  // query db for all houses - pass data to houses view
  House.find({})
    .then(houses => res.render("houses", { houses, page_name: "houses" }))
    .catch(err => next(err));
};

exports.new = (req, res) => res.render("new-house", { page_name: "new-house" });

exports.add = (req, res) => {
  // combine all house details
  let newHouse = req.body;
  // setup thumbnail image
  newHouse.thumbnail = {};
  newHouse.thumbnail.url = req.files.thumbnail[0].secure_url;
  newHouse.thumbnail.id = req.files.thumbnail[0].public_id;
  // setup gallery
  newHouse.gallery = {};
  // check if any images uploaded
  if (req.files.gallery) {
    // add to gallery object each image url under the key of it's cloudinary id
    req.files.gallery.forEach(
      image => (newHouse.gallery[image.public_id] = image.secure_url)
    );
  }

  // add hosue to db & redirect
  House.create(newHouse)
    .then(() => res.redirect("/houses"))
    .catch(err => {
      console.log(err);
      res.redirect("/houses/new");
    });
};

exports.single = (req, res) => {
  // locate house in db & render single-view page
  House.findById(req.params.id)
    .then(house => {
      res.render("house-single", { house, page_name: "house-single" });
    })
    .catch(err => {
      console.log(err);
      res.redirect("/houses");
    });
};

exports.edit = (req, res) => {
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
};

exports.delete = (req, res, next) => {
  const houseId = req.params.id;
  House.findById(houseId)
    .then(house => {
      // check if any images in gallery
      const hasGallery = !!Object.keys(house.gallery).length;
      if (hasGallery) {
        // delete each gallery image from cloudinary
        Object.keys(house.gallery).forEach(key =>
          cloudinary.v2.uploader.destroy(key)
        );
      }
      // delete thumbnail from cloudinary
      cloudinary.v2.uploader.destroy(house.thumbnail.id);
    })
    .then(() =>
      House.findByIdAndRemove(houseId)
        .then(data =>
          res.json({
            status: true,
            url: "/houses",
            message: "Property removed successfully."
          })
        )
        .catch(err => next(err))
    )
    .catch(err => next(err));
};

exports.deleteGallery = (req, res) => {
  const houseId = req.params.id;
  const galleryId = req.body.galleryId;
  cloudinary.v2.uploader.destroy(galleryId, function() {
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
};
