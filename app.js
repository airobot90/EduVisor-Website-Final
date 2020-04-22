require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const favicon = require("express-favicon");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.SERVICE_MAIL,
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.PASS_MAIL,
  },
});

const mailOptions = {
  from: process.env.FROM_USER_MAIL,
  to: "eduvisor85@gmail.com",
  subject: "Nowe zapytanie",
  text: "Nowe zapytanie ze strony www.eduvisor.pl",
};

const app = express();

app.use(favicon(__dirname + "/public/favicon.ico"));

app.set('view engine', 'ejs');

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(express.static("public"));

mongoose.connect(process.env.URL_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  typeOfThesis: Array,
  scopeOfHelp: Array,
  timeOfProject: Array,
  description: String,
  files: Array,
});

const User = mongoose.model("User", userSchema);

// 1. ROUTE -> STRONA GŁÓWNA

app.get("/", function (req, res) {
  res.render("home", {
    title: "EduVisor - Twoja kompleksowa pomoc na studiach",
  });
});

app.get("/formularz", function (req, res) {
  res.render("form", {
    title: "Formularz zlecenia - EduVisor",
  })
});


app.get("/regulamin", function (req, res) {
  res.render("statute", {
    title: "Regulamin - EduVisor"
  })
});

app.get("/polityka-prywatnosci", function (req, res) {
  res.render("privacy-policy", {
    title: "Polityka prywatności - EduVisor"
  });
});

app.post("/formularz", function (req, res) {
  const user = new User({
    email: req.body.email,
    typeOfThesis: req.body.typeOfThesis,
    scopeOfHelp: req.body.scopeOfHelp,
    timeOfProject: req.body.timeOfProject,
    description: req.body.description,
    files: req.body.files,
  });

  user.save(function (err) {
    if (!err) {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email wyslany: " + info.response);
        }
      });

      res.redirect("/");
    } else {
      res.send(
        '<script>alert("Wystąpił błąd podczas wysyłania formularza. Spróbuj jeszcze raz!")</script>'
      );
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});