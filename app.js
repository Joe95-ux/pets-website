//jshint esversion:8

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const _ = require("lodash");
const sendMail = require("./mail");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const MongoStore = require("connect-mongo");
const connectDB = require("./config/db");
// const pups = require(__dirname + "/data.js");
const { getMaxListeners } = require("process");
const Pup = require("./models/pups");
const {ensureAuth, ensureGuest} = require("./middleware/auth");

const userSchema = require("./models/userSchema");
// const pupData = require("./puppyData.json");
const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(
  express.json({
    type: "application/json",
  })
);

app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));

connectDB();

// define storage for images

const storage = multer.diskStorage({
  //destination for files
  destination: function (request, file, callback) {
    callback(null, "public/uploads/images");
  },
  //fileName
  filename: function (request, file, callback) {
    callback(null, Date.now() + file.originalname);
  },
});

//upload parameters for multer
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 1024 * 1024 * 3,
  },
});

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, mongoOptions: { useUnifiedTopology: true } }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.set("useCreateIndex", true);

userSchema.plugin(passportLocalMongoose);

const User = require("./models/user");

//passport local configurations.
passport.use(User.createStrategy());
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// async function getPups() {
//     try {
//         let response = await pups.getPuppies();
//         return response;
//     } catch (err) {
//         console.log(err);
//     }
// }

app.get("/", function (req, res) {
  Pup.find({}, function (err, puppies) {
    if (!err) {
      res.render("home", {
        allPuppies: puppies,
      });
    }
  });
});

app.post("/uploads", upload.single("image"), ensureAuth, async (req, res) => {
  let puppy = new Pup({
    img: req.file.filename,
    name: req.body.name,
    sex: req.body.sex,
    age: req.body.age,
    vaccination: req.body.vaccination,
    price: req.body.price,
  });
  try {
    puppy = await puppy.save();
    res.redirect("/");
  } catch (error) {
    console.log(error);
  }
});

app.get("/puppies/:puppyName", async (req, res) => {
  const requestedPuppy = req.params.puppyName;
  // getPups().then((response) => {

  //     response.forEach((puppy) => {
  //         let pupName = puppy.name;
  //         if (requestedPuppy === pupName) {
  //             res.render("puppy", {
  //                 image: puppy.img,
  //                 name: puppy.name,
  //                 sex: puppy.sex,
  //                 age: puppy.age,
  //                 vaccination: puppy.vaccination,
  //                 price: puppy.price

  //             });
  //         }
  //     });

  // });
  let puppy = await Pup.findOne({ name: requestedPuppy });
  if (puppy) {
    res.render("puppy", { puppy: puppy });
  } else {
    res.redirect("/");
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/admin", ensureGuest, function (req, res) {
  res.render("admin");
});

app.get("/register", ensureGuest, function (req, res) {
  res.render("register");
});

app.get("/login", ensureGuest, function (req, res) {
  res.render("login");
});

app.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});

app.get("/uploads", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("uploads");
  } else {
    res.redirect("/login");
  }
});

app.get("/contact", function (req, res) {
  res.render("contact");
});

app.get("/privacy", function (req, res) {
  res.render("privacy", {
    listTitle: "Privacy Policy",
  });
});

app.get("/shipping", function (req, res) {
  res.render("shipping", {
    listTitle: "Shipping",
  });
});

app.post("/register", function (req, res) {
  User.register(
    { username: req.body.username },
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/uploads");
        });
      }
    }
  );
});

app.post("/login", function (req, res) {
  const user = new User({
    username: req.body.username,
    passsword: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/uploads");
      });
    }
  });

  
});

app.post("/email", function (req, res) {
  //send email here.
  const { email, subject, text } = req.body;
  console.log("Data:", req.body);
  sendMail(email, subject, text, function (err, data) {
    if (err) {
      res.status(500).json({
        message: "Internal Error",
      });
    } else {
      res.json({
        message: "Email sent",
      });
    }
  });
});

app.listen(9000, function () {
  console.log("server has started on port 9000");
});
