const DjSet = require("../models/djSet");
const song = require("../models/song");
const { getSongById } = require("./songService");
/**
 * Fetches all sets from the sets collection in the database.
 * @returns  {*} payload - { data, err } - data contains sets found in
 * the database, and err contains error messages if any errors occured.
 */
const getAllSets = async () => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  // trying to get sets from database.
  try {
    const allSets = await DjSet.find().populate("songs");
    payload.data = allSets;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes an id and searches sets collection for a set with a matching id, and
 * returns the set.
 * @param {*} id - unique id of set in the database.
 * @returns {*} payload - { data, err } - data contains set with matching
 * id if found, and err contains error messages if any exists.
 */
const getSetById = async (id) => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  // trying to get a set from database
  try {
    const djSet = await DjSet.findById(id).populate("songs");
    payload.data = djSet;
  } catch (err) {
    payload.err = err;
  }

  return payload;
};

const createNewSet = async ({ title, creator, is_published, tags, songs }) => {
  let payload = {
    data: undefined,
    err: undefined,
  };

  //
  const newDjSet = new DjSet({
    title: title,
    creator: creator,
    is_published: is_published,
    tags: tags,
    songs: songs,
  });

  // try to save object to database and get newly created document.
  try {
    let savedDjSet = await newDjSet.save();
    await savedDjSet.populate("songs");
    payload.data = savedDjSet;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes a set id and updates fields in the document with those specified.
 * returns the new updated dj set
 * @param {*} setId - the set id to update
 * @param {*} update - an object containing the fields to update and what to update them with
 * @returns payload - {data, err} data contains the new updated dj set.
 * err is error messages if any exist
 */
const updateDjSetById = async (setId, update) => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  try {
    const djSet = await DjSet.findById(setId);
    if (djSet.is_published) {
      payload.err = Error(
        "Error: attempted to edit a published set with id: " + setId
      );
    } else {
      await djSet.updateOne(update);
      //djSet.save();
      payload.data = await DjSet.findById(setId);
    }
    //const djSet = await DjSet.findByIdAndUpdate(setId, update, { new: true });
    //payload.data = djSet;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes an id and deletes the set with that corresponding id from the database.
 * Returns an object containing 3 fields:
 * "n": the number of matched albumDetails
 * "ok": 1 if the DjSet was deleted successfully
 * "deletedCount": the number of albumDetails deleted (should only ever be 1)
 * @param {*} setId - the ID of the set to be deleted
 * @returns {*} payload - {data, err}.
 * data is the object with 3 fields mentioned above relating to the success
 * of deleting an albumDetail.
 * err is error messages if any exist
 */
const deleteDjSetById = async (setId) => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  try {
    const deletedDjSet = await DjSet.deleteOne({ _id: setId });
    payload.data = deletedDjSet;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

module.exports = {
  getAllSets,
  getSetById,
  createNewSet,
  updateDjSetById,
  deleteDjSetById,
};
