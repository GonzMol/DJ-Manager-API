const { checkSchema } = require("express-validator");

// validation for dj set post,put,patch requests, anything that changes
// a dj set.
const validateDjSet = checkSchema({
  "data.title": {
    exists: {
      errorMessage: "Title for a Dj set is required.",
      options: { checkFalsy: true },
    },
    isString: { errorMessage: "Title of a Dj set must of type String." },
  },
  "data.creator": {
    exists: {
      errorMessage: "A creator is required for a Dj set.",
      options: { checkFalsy: true },
    },
    isString: { errorMessage: "Creator must be of type String." },
  },
  "data.is_published": {
    exists: {
      errorMessage: "A Dj set must have a publish status.",
    },
    isBoolean: { errorMessage: "Publish status must be of type boolean." },
  },
  "data.songs": {
    exists: {
      errorMessage: "A set must contain at least one song.",
      options: { checkFalsy: true },
    },
    isArray: {
      errorMessage: "Songs should be an array of Mongodb Object Ids'.",
    },
  },
});

module.exports = {
  validateDjSet,
};
