const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const House = require("./models/House");

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// parse application/json
app.use(express.json());

app.get("/", (req, res) => res.render("index"));

app.get("/houses", (req, res) => {
  // query db for all houses - pass data to houses view
  House.find({}).then(houses => res.render("houses", { houses }));
});

app.get("/houses-new", (req, res) => res.render("new-house"));

app.post("/houses", (req, res) => {
  // create new house, redirect to houses view
  House.create(req.body).then(newHouse => res.redirect("/houses"));
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
