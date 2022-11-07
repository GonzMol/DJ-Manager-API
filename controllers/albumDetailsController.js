/*
 validate errors follow this style 
 https://express-validator.github.io/docs/index.html
*/

const AlbumDetailsService = require("../services/albumDetailsService");
const SongService = require("../services/songService");
const DjSetService = require("../services/djSetService");
const { validationResult } = require("express-validator");

/**
 * Takes a GET request and returns a payload with data about
 * all AlbumDetails documents.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken from http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
const getAllAlbumDetails = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };
  // fetching data from database
  const { data, err } = await AlbumDetailsService.getAllAlbumDetails();
  // database err
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }
  // successful search but album-details collection is empty
  if (data.length === 0) {
    payload.errors = [{ msg: "allalbumdetails collection is empty." }];
    return res.status(404).json(payload);
  }
  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

/**
 * Takes a POST request to create a new album details and saves the new
 * album details and corresponding songs to the database. Returns a 
 * payload with the new created document. An album details can only 
 * be created if it has a unique label number, otherwise the request 
 * will be rejected.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken form http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
const createNewAlbumDetails = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };

  /* First of all, check the validation result from req */

  // receives errors from validation
  const errors = validationResult(req);
  // if there errors from data validation we send back error messages
  if (!errors.isEmpty()) {
    payload.errors = errors.array();
    return res.status(400).json(payload);
  }

  /* Attempt to save the new album_detail into database */

  // check if an existing album exists, checking unique label number.
  const { data: existing_albumDetails, err: existing_err } =
    await AlbumDetailsService.getAlbumDetailsByLabelNumber(
      req.body.data.album_details.label_number
    );
  if (existing_albumDetails) {
    // this label number already exists so we cannot make proceed with this request.
    // send error message
    const errArray = [
      { msg: "This label number is already associated with another album." },
    ];
    // add additional errors from service function if any existing.
    if (existing_err?.message) errArray.push({ msg: existing_err.message });
    payload.data = existing_albumDetails;
    payload.errors = errArray;
    return res.status(400).json(payload);
  }
  // creating album details in database, returns newly made document.
  const { data: saved_album_details, err: saved_album_err } = await AlbumDetailsService.createNewAlbumDetails(
    req.body.data.album_details
  );
  // errors from the database. if present, send back error message.
  if (saved_album_err) {
    payload.errors = [{ msg: saved_album_err.message }];
    return res.status(500).json(payload);
  }

  /* Attempt to save songs associated with the earlier saved album_detail */

  // extract the database object id of earlier saved album detail
  const album_id = saved_album_details._id;

  // add the album_id into every songs
  const songs = req.body.data.songs;
  for (let s of songs) {
    s.album_id = album_id;
  }

  // save songs into databse
  const { data: saved_songs, err: saved_songs_err } = await SongService.insertNewSongs(songs);
  
  // errors from the database. if present, send back error message.
  if (saved_songs_err) {
    payload.errors = [{ msg: saved_songs_err.message }];
    return res.status(500).json(payload);
  }
  
  // successful, note status 201 for creating resource in database.
  payload.success = true;
  payload.data = {
    album_details: saved_album_details,
    songs: saved_songs
  };
  return res.status(201).json(payload);
};

/**
 * Takes a POST request to delete an albumDetails by id.
 * Returns a payload with info relating to the deleted document.
 * @param {*} req
 * @param {*} res
 * @returns payload - {success, data, errors}. success is the
 * status of the request, data contains data from deleting the album,
 * errors contains error message if any exist.
 */
const deleteAlbumDetailsbyId = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };

  const id = req.params.id;

  // First find all the songs of this ablum
  const { data: albumSongs, err: albumSongErr } =
    await SongService.getSongByAlbumId(id);

  // Next find all the dj sets
  const { data: djSets, err: setErr } = await DjSetService.getAllSets();

  if (albumSongErr || setErr) {
    payload.errors = [{ msg: albumSongErr.message }, { msg: setErr.message }];
    return res.status(500).json(payload);
  }

  // Compare the ablumSongs and songs in every dj sets
  // If any song in albumSongs appears in songs of a dj set, save it for now
  const conflict = [];
  for (let set of djSets) {
    for (let setSong of set.songs) {
      for (let albumSong of albumSongs) {
        if (albumSong._id.toString() == setSong._id.toString()) {
          conflict.push({
            song_id: albumSong._id,
            song_title: albumSong.title,
            djSet_id: set._id,
            djSet_title: set.title,
          });
        }
      }
    }
  }

  if (conflict.length > 0) {
    payload.errors = [
      {
        msg:
          "Unable to delete ablumDetail with id:" +
          id +
          " due to its songs\
 present in some exsisting dj sets. For more information see confict.",
      },
      { conflict: conflict },
    ];
    return res.status(400).json(payload);
  }

  // If no conflicts between this ablum and any dj set, delete ablum and songs
  const { data, err } = await AlbumDetailsService.deleteAlbumDetailsbyId(id);

  const { data: songData, err: songErr } =
    await SongService.deleteSongByAlbumId(id);

  if (err || songErr) {
    payload.errors = [{ msg: err.message }, { msg: songErr.message }];
    return res.status(500).json(payload);
  }

  if (data.deletedCount < 1) {
    payload.errors = [
      { msg: "No album-details with id: " + id + " was found." },
    ];
    return res.status(404).json(payload);
  }

  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

/**
 * Takes a GET request to find an albumdetails with a matching path parameter id.
 * Returns a payload with matching album details.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken form http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
const getAlbumDetailsById = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };
  // extracting id from path parameters
  const id = req.params.id;
  // fetching data from database
  const { data, err } = await AlbumDetailsService.getAlbumDetailsById(id);
  // errors from the database. if present, send back error message.
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  // if data is null, then no album-details matching that id was found.
  if (!data) {
    payload.errors = [
      { msg: "No album-details with id: " + id + " was found." },
    ];
    return res.status(404).json(payload);
  }

  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

/**
 * Takes a GET request to find an albumdetails with a matching query parameter title.
 * Returns a payload with an array of album details matching query.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken form http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
const searchAlbumDetailsbyTitle = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };
  // if there is no title query parameter, we get an empty
  // data: [] after calling service.
  const title = req.query?.title;

  // fetching data from database
  const { data, err } = await AlbumDetailsService.searchAlbumDetailsbyTitle(
    title
  );
  // errors from the database. if present, send back error message.
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  // if there is no album-details with title found, we get an empty
  // data: [] after calling service.
  // if data is null, then no matches were found
  if (data.length === 0) {
    payload.errors = [
      { msg: 'No album-details with the title: "' + title + '" was found.' },
    ];
    return res.status(404).json(payload);
  }

  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

/**
 * Takes a GET request to find an albumdetails with a matching path parameter num.
 * Returns a payload with matching album details.
 * @param {*} req request object - taken from http request.
 * @param {*} res response object - taken form http request.
 * @returns {*} payload - {success, data, errors}. success is
 * the status of the request, data contains data from database, errors
 * contains error messages if any exist.
 */
 const getAlbumDetailsByLabelNumber = async (req, res) => {
  let payload = {
    success: false,
    data: undefined,
    errors: undefined,
  };
  // extracting id from path parameters
  const labelNum = req.params.num;
  // fetching data from database
  const { data, err } = await AlbumDetailsService.getAlbumDetailsByLabelNumber(labelNum);
  // errors from the database. if present, send back error message.
  if (err) {
    payload.errors = [{ msg: err.message }];
    return res.status(500).json(payload);
  }

  // if data is null, then no album-details matching that id was found.
  if (!data) {
    payload.errors = [
      { msg: "No album-details with label number: " + labelNum + " was \
found." },
    ];
    return res.status(404).json(payload);
  }

  // successful
  payload.success = true;
  payload.data = data;
  return res.status(200).json(payload);
};

module.exports = {
  getAllAlbumDetails,
  createNewAlbumDetails,
  getAlbumDetailsById,
  searchAlbumDetailsbyTitle,
  deleteAlbumDetailsbyId,
  getAlbumDetailsByLabelNumber,
};
