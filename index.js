const app = require("./app");

// tells app to liston on port.
app.listen(process.env.PORT || 9000, () => {
  //if (process.env.NODE_ENV == "test") return;
  if (process.env.PORT) {
    console.log(`Server started at ${process.env.PORT}`);
  } else {
    console.log(`Server started at 9000`);
  }
});

module.exports = app;
