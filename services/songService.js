/* This file is database service functions of songs */

const song = require("../models/song");
const SongModel = require("../models/song");

/**
 * Insert a new song into database.
 *
 * @param {*} newSongs - {songs: [{title, artists, album_id}, etc]}.
 * @returns {*} payload - {data, err}.
 * data is the details of the song, and err is object
 * with error messages if any exists.
 */
const insertNewSongs = async (newSongs) => {
  let payload = {
    data: [],
    err: undefined,
  };

  for (let eachSong of newSongs) {
    // create a new songModel instance, load the details
    let songModel = new SongModel({
      title: eachSong.title,
      artists: eachSong.artists,
      album_id: eachSong.album_id,
    });

    // trying to save this model into database
    try {
      let dbResponse = await songModel.save();
      payload.data.push(dbResponse);
    } catch (err) {
      payload.err = err;
    }
  }

  return payload;
};

/**
 * Takles an id and searches for a song with matching id. If found,
 * returns song with that id.
 *
 * @param {*} id - MongoDb _id identifier for song details
 * @returns payload -{data,err} data contains the song with
 * with the unique id. err is error messages if any exist.
 */
const getSongById = async (id) => {
  let payload = {
    data: undefined,
    err: undefined,
  };

  try {
    const songDetails = await song.findById(id);
    payload.data = songDetails;
  } catch (err) {
    payload.err = err;
  }

  return payload;
};

/**
 * Find songs by their title and one artist of their artists.
 *
 * @param {*} query - {title, artists}.
 * @returns {*} payload - {data, err}.
 * data is the details of the song, and err is object
 * with error messages if any exists.
 */
const findSongsByProperty = async (query) => {
  let payload = {
    data: [],
    err: undefined,
  };

  // handle the undefined property in the query
  // searching undefined property into database won't get any result
  let title = "";
  let artist = "";
  if (query.title != undefined) title = query.title;
  if (query.artist != undefined) artist = query.artist;

  // regex string, title or artists must be at the start of the corresponding
  // property in songs
  const titleRegex = "^" + title;
  const artistRegex = "^" + artist;

  try {
    const songs = await SongModel.find({
      title: {
        $regex: titleRegex,
        $options: "i",
      },
      artists: {
        $regex: artistRegex,
        $options: "i",
      },
    });
    payload.data = songs;
  } catch (err) {
    payload.err = err;
  }

  return payload;
};

/**
 * Takles an album_id and searches for a song with matching album_id. If found,
 * return an array of songs with that id.
 *
 * @param {*} id - MongoDb album_id identifier for album details
 * @returns payload -{data,err} data contains the song with
 * with the unique id. err is error messages if any exist.
 */
const getSongByAlbumId = async (id) => {
  let payload = {
    data: undefined,
    err: undefined,
  };

  try {
    const songs = await song.find({ album_id: id });
    payload.data = songs;
  } catch (err) {
    payload.err = err;
  }

  return payload;
};

/**
 * Takles an album_id and searches for a song with matching album_id. If found,
 * delete songs with that id in database.
 *
 * @param {*} id - MongoDb album_id identifier for album details
 * @returns payload -{data,err} data contains the song with
 * with the unique id. err is error messages if any exist.
 */
const deleteSongByAlbumId = async (id) => {
  let payload = {
    data: undefined,
    err: undefined,
  };

  try {
    const songs = await song.deleteMany({ album_id: id });
    payload.data = songs;
  } catch (err) {
    payload.err = err;
  }

  return payload;
};

module.exports = {
  insertNewSongs,
  getSongById,
  getSongByAlbumId,
  findSongsByProperty,
  deleteSongByAlbumId,
};
