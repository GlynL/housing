# TODO:
  * check update/delete house routes
  * refresh - stay logged in 
  * add authentication for update/delete routes 

<!-- ALL THIS WAS FIRST ATTEMPT - CHANGED - WROTE BLOG -->

# HTML

- form needs right enctype to process file <!--  enctype='multipart/form-data'  -->
- name of input have input type file & name

<form action='/houses' method="post" enctype="multipart/form-data">
  <div class='form-group'>
    <label for='thumbnail'>Image</label>
    <input type='file' class='form-control-file' id='thumbnail' name='thumbnail' placeholder='Enter your properties name.'>
  </div>
</form>

# Node

- setup multer and cloudinary

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const cloudinary = require("cloudinary");

cloudinary.config({
cloud_name: "daqgcqpx2",
api_key: "814472439992437",
api_secret: "hX1-exAwBGcmrzR0XXo6gU5Ey70"
});

- call upload as a middleware of route
  upload.single("thumbnail") <!-- name must match the name of input in html -->

- req.file no accessible
