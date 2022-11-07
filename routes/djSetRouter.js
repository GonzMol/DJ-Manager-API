const express = require("express");
const djSetRouter = express.Router();
const djSetController = require("../controllers/djSetController");
const { validateDjSet } = require("../validations/djSet.validation");

// Routes for dj sets.

// gets all dj sets.
djSetRouter.get("/sets", djSetController.getAllSets);

// gets set by id
djSetRouter.get("/sets/:id", djSetController.getSetById);

// creates a new set
djSetRouter.post("/sets", validateDjSet, djSetController.createNewSet);

//update existng set
djSetRouter.post("/sets/:id", validateDjSet, djSetController.updateDjSetById);

//delete existing set
djSetRouter.delete("/sets/:id", validateDjSet, djSetController.deletedSetById);

module.exports = djSetRouter;
