require("dotenv").config();

const express = require("express");
const albumRouter = require("./routes/albumRouter");
const songRouter = require("./routes/songRouter");
const djSetRouter = require("./routes/djSetRouter");
const cors = require("cors");
// connects to mongodb
require("./models/index.js");

// starts our app
const app = express();

if (process.env.NODE_ENV == "production") {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
    })
  );
} else {
  app.use(
    cors({
      origin: "http://localhost:3000",
    })
  );
}

// for handling JSON, within POST requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Our routes
app.use("/api", albumRouter);
app.use("/api", djSetRouter);
app.use("/api", songRouter);

module.exports = app;
