const House = require("../models/House");
const cloudinary = require("cloudinary");
const nodemailer = require("nodemailer");

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
  try {
    // locate house in db & render single-view page
    const house = await House.findById(req.params.id);
    const currentUser = req.user ? req.user.id : undefined;
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

exports.enquire = async function(req, res, next) {
  let houseEmail;
  try {
    const house = await House.findById(req.params.id).populate("user");
    houseEmail = house.user.email;
  } catch (err) {
    next(err);
  }

  // setup email service
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const content = `
    <div>
      <p>${req.body.message}</p>
      <h2>Please reply to this email to continue the conversation.</h2>
    </div>
  `;

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Pai Housing" <glynlewington@gmail.com>', // sender address
    to: houseEmail, // list of receivers
    replyTo: req.user.email,
    subject: "Someone is interested in your property.", // Subject line
    text: req.body.message, // plain text body
    html: content // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  });

  res.redirect("/");
};
