/* Here we put all the album database functions */
/* Note: err objects here follow 
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error 
*/

const AlbumDetails = require("../models/albumDetails");

/**
  Fetches all album details in the database and returns an object containing 
  all album details and an error object if any errors occured.

  @returns {*} payload - contains property "data" for all album details
  in the database and property "err" if any errors occured.
*/
const getAllAlbumDetails = async () => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  // trying to get payload from database.
  try {
    const allAlbumsDetails = await AlbumDetails.find();
    payload.data = allAlbumsDetails;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes details of a new album and saves it into the database. Returns
 * newly saved database object.
 *
 * @param {*} details - {title, record_label, label_number, artists, tags}.
 * Details of the album to be saved in database.
 * @returns {*} payload - {data, err}.
 * data is the details of the newly saved album, and err is object
 * with error messages if any exists.
 */
const createNewAlbumDetails = async (details) => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  // making new albumdetails model object to insert in db.
  const albumDetails = new AlbumDetails({
    title: details.title,
    record_label: details.record_label,
    label_number: details.label_number,
    artists: details.artists,
    tags: details.tags,
  });
  // saving object to db.
  try {
    const albumToSave = await albumDetails.save();
    payload.data = albumToSave;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes an id and deletes the album with that corresponding id from the database.
 * Returns an object containing 3 fields:
 * "n": the number of matched albumDetails
 * "ok": 1 if the alnumDetail was deleted successfully
 * "deletedCount": the number of albumDetails deleted (should only ever be 1)
 * @param {*} id - the ID of the object to be deleted
 * @returns {*} payload - {data, err}.
 * data is the object with 3 fields mentioned above relating to the success
 * of deleting an albumDetail.
 * err is error messages if any exist
 */
const deleteAlbumDetailsbyId = async (id) => {
  let payload = {
    data: undefined,
    err: undefined,
  };

  try {
    const deletedAlbum = await AlbumDetails.deleteOne({ _id: id });
    payload.data = deletedAlbum;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes an id and searches for an album details with id. if found,
 * returns album with that id.
 *
 * @param {String} id - MongoDb _id identifier for the album details.
 * @returns {*} payload - {data, err}. data contains the album details
 * with the unique id. err is error messages if any exists.
 */
const getAlbumDetailsById = async (id) => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  //
  try {
    const albumDetails = await AlbumDetails.findById(id);
    payload.data = albumDetails;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes a title and searches for album details whose title starts with
 * title. Returns an array of albums details. Note: This returns all album
 * details that start with the title. Search is also case-insensitive.
 * @param {String} title - title of album details
 * @returns {*} payload - {data, err}. data contains the array of album details.
 * err is error messages if any exists.
 */
const searchAlbumDetailsbyTitle = async (title) => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  // regex string, title must be at the start of the property title in
  // albumDetails
  const titleRegex = "^" + title;

  try {
    const albumDetails = await AlbumDetails.find({
      title: {
        $regex: titleRegex,
        $options: "i",
      },
    });
    payload.data = albumDetails;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

/**
 * Takes a label number and searches for an album details with this label number. if found,
 * returns album with that label number, returns null otherwise.
 *
 * @param {String} label_number - label number of the album
 * @returns {*} payload - {data, err}. data contains the album details
 * with the unique label_number. err is error messages if any exists.
 */
const getAlbumDetailsByLabelNumber = async (label_number) => {
  let payload = {
    data: undefined,
    err: undefined,
  };
  //
  try {
    const albumDetails = await AlbumDetails.findOne({
      label_number: label_number,
    });
    payload.data = albumDetails;
  } catch (err) {
    payload.err = err;
  }
  return payload;
};

module.exports = {
  getAllAlbumDetails,
  createNewAlbumDetails,
  getAlbumDetailsById,
  searchAlbumDetailsbyTitle,
  getAlbumDetailsByLabelNumber,
  deleteAlbumDetailsbyId,
};
