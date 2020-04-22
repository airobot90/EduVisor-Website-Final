// npm init --y
// jak chce go otworzyc na innym komputerze to bez npm init, a za to npm install
// npm i express body-parser mongoose dotenv express-favicon ejs nodemailer

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

// app.set('view engine', 'ejs');

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

// tworzymy strukture naszej bazy
const userSchema = new mongoose.Schema({
  // juz w schema moge dodac walidacje -> tutaj, ze pole name jest obowiazkowe do wypelnienia
  email: String,
  typeOfThesis: Array,
  scopeOfHelp: Array,
  timeOfProject: Array,
  description: String,
  // https://www.npmjs.com/package/multer-gridfs-storage
  // https://stackoverflow.com/questions/54788507/how-to-combine-schema-model-with-file-upload-in-node-js-and-mongodb
  // https://docs.mongodb.com/manual/core/gridfs/
  // files: { data: Buffer, contentType: String } dobre jak pliki maja do 16 MB
  files: Array,
});

const User = mongoose.model("User", userSchema);

// 1. ROUTE -> STRONA GŁÓWNA

// chce dostac zawartosc /, w odpowiedzi dostaje plik html
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/formularz", function (req, res) {
  res.sendFile(__dirname + "/form.html")
});


app.get("/regulamin", function (req, res) {
  res.sendFile(__dirname + "/statute.html");
});

app.get("/polityka-prywatnosci", function (req, res) {
  res.sendFile(__dirname + "/privacy-policy.html");
});

app.post("/formularz", function (req, res) {

  // teraz mozemy stworzyc item document/nowy rekord
  const user = new User({
    email: req.body.email,
    typeOfThesis: req.body.typeOfThesis,
    scopeOfHelp: req.body.scopeOfHelp,
    timeOfProject: req.body.timeOfProject,
    description: req.body.description,
    files: req.body.files,
  });

  // jesli jakis blad przy zapisaniu postu wyskakuje blad, a jak wszystko ok to przekierowuje nas do strony glownej
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