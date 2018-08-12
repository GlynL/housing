const House = require("../models/House");
const cloudinary = require("cloudinary");

exports.houses = async (req, res, next) => {
  // query db for all houses - pass data to houses view
  try {
    const houses = await House.find({});
    res.render("houses", { houses, page_name: "houses" });
  } catch (err) {
    next(err);
  }
};

exports.new = (req, res) => res.render("new-house", { page_name: "new-house" });

exports.add = async (req, res, next) => {
  // combine all house details
  let newHouse = req.body;
  // save user to house
  newHouse.user = req.user;
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
  try {
    // add hosue to db & redirect
    await House.create(newHouse);
    res.redirect("/houses");
  } catch (err) {
    next(err);
  }
};

exports.single = async (req, res, next) => {
  const currentUser = req.user ? req.user.id : undefined;
  try {
    // locate house in db & render single-view page
    const house = await House.findById(req.params.id);
    const userHouse = String(house.user) === currentUser;
    res.render("house-single", { house, userHouse, page_name: "house-single" });
  } catch (err) {
    next(err);
  }
};

exports.edit = async (req, res, next) => {
  let updateHouse = req.body;

  if (req.files) {
    try {
      const house = await House.findById(req.params.id);
      // delete image from cloud server
      if (req.files.thumbnail) {
        cloudinary.v2.uploader.destroy(house.thumbnail.id);
        updateHouse.thumbnail = { url: null, id: null };
        updateHouse.thumbnail.url = req.files.thumbnail[0].secure_url;
        updateHouse.thumbnail.id = req.files.thumbnail[0].public_id;
      }
      if (req.files.gallery) {
        updateHouse.gallery = house.gallery || {};
        req.files.gallery.forEach(
          image => (updateHouse.gallery[image.public_id] = image.secure_url)
        );
      }

      updateHouseDb(updateHouse);
    } catch (err) {
      next(err);
    }
  } else updateHouseDb(updateHouse);

  async function updateHouseDb(house) {
    try {
      await House.findByIdAndUpdate(req.params.id, house);
      res.redirect(`/houses/${req.params.id}`);
    } catch (err) {
      next(err);
    }
  }
};

exports.delete = async (req, res, next) => {
  const houseId = req.params.id;
  try {
    const house = await House.findById(houseId);
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

    await House.findByIdAndRemove(houseId);
    res.json({
      status: true,
      url: "/houses",
      message: "Property removed successfully."
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteGallery = async (req, res, next) => {
  const houseId = req.params.id;
  const galleryId = req.body.galleryId;
  cloudinary.v2.uploader.destroy(galleryId);
  try {
    const house = await House.findById(houseId);
    delete house.gallery[galleryId];
    const updatedHouse = await House.findByIdAndUpdate(houseId, house, {
      new: true
    });
    res.json({ status: true, house: updatedHouse });
  } catch (err) {
    next(err);
  }
};
