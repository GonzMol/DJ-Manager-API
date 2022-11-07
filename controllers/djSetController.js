//

const DjSetService = require("../services/djSetService");
const { validationResult } = require("express-validator");

/**
 * Takes a GET request and returns a payload with data about all set documents.
 *
 * @param {*} req request object - taken from http request.
 * @param {*} res request object - taken from http request.
 * @returns {*} payload - {success, data, errors}. sucess is
 * the status of the request, data contains djset from database,
 * errors contains error messages if any exist.
 */
const getAllSets = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };
  // fetching data from database
  const { data, err } = await DjSetService.getAllSets();
  // database err
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  // success
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

/**
 * takes a GET request with a djset id and returns the djset
 * with a matching id.
 * @param {*} req request object - taken from http request
 * @param {*} res response object - taken from http request
 * @returns {*} payload - { success, data, errors } - success is
 * the status of request, data contains djset from database, errors
 * contains error messages if any exists.
 */
const getSetById = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };

  const id = req.params.id;

  // fetch data from database
  const { data, err } = await DjSetService.getSetById(id);

  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  if (!data) {
    payload.errors = [{ msg: `No set with id: ${id} was found` }];
    return res.status(404).json(payload);
  }

  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

const createNewSet = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };

  // validation checking for all details needed for a dj set.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    payload.errors = errors.array();
    return res.status(400).json(payload);
  }
  // creating new set in database, returns newly made djset document.
  const { data, err } = await DjSetService.createNewSet(req.body.data);
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }
  // successful
  payload.success = true;
  payload.data = data;
  return res.status(201).json(payload);
};

const updateDjSetById = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };

  // validation checking for all details needed for a dj set.
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    payload.errors = errors.array();
    return res.status(400).json(payload);
  }

  const { data, err } = await DjSetService.updateDjSetById(
    req.params.id,
    req.body.data
  );

  if (!data) {
    payload.errors = [
      { msg: "No set with id: " + req.params.id + " was found." },
    ];
    return res.status(404).json(payload);
  }

  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

const deletedSetById = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };

  const id = req.params.id;
  const { data, err } = await DjSetService.deleteDjSetById(id);
  if (data.deletedCount < 1) {
    payload.errors = [
      { msg: "No album-details with id: " + id + " was found." },
    ];
    return res.status(404).json(payload);
  }

  if (err) {
    payload.errors = { msg: err.message };
    return res.status(500).json(payload);
  }

  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

module.exports = {
  getAllSets,
  getSetById,
  createNewSet,
  updateDjSetById,
  deletedSetById,
};
