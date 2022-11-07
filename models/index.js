// config for hosting site later, Heroku?
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
// ensures real database connection does not happen when running tests.
if (process.env.NODE_ENV !== "test") {
  mongoose.connect(process.env.MONGO_URL || "mongodb://localhost", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "DJ-Manager",
  });

  const db = mongoose.connection.on("error", (err) => {
    console.error(err);
    process.exit(1);
  });

  db.once("open", async () => {
    console.log(`Mongo connection started on ${db.host}:${db.port}`);
  });
}

// place required models for project here.
require("./albumDetails");
require("./song");
require("./djSet");
