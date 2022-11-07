const db = require("./db");
const DjSetService = require("../services/djSetService");
const SongService = require("../services/songService");
const AlbumDetailsService = require("../services/albumDetailsService");
// setup connection to in-memory database.
beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

describe("Service Function: createNewSet (correct request)", () => {
  test("It should return newly created document from database", async () => {
    // make an album for songs
    const albumDetails1 = {
      title: "The First Inc.",
      record_label: "Squid Inc.",
      label_number: "DIUQS21",
      artists: ["Mr.Squid", "Andrew"],
      tags: ["JAZZ", "RNB"],
    };

    // make an album for songs to belong to.
    let albumPayload = await AlbumDetailsService.createNewAlbumDetails(
      albumDetails1
    );
    // songs that will be used in the set.
    let songs = [
      {
        title: "Griddy Me",
        artists: ["Andrew 1", "Sun NY"],
      },
      {
        title: "Down bad",
        artists: ["An Tony", "ArcherWoo"],
      },
      {
        title: "Crazy Simps",
        artists: ["Dcho", "DH"],
      },
    ];
    // add album_id to the songs.
    for (i = 0; i < songs.length; i++) {
      songs[i].album_id = albumPayload.data._id;
    }
    // putting songs into database first.
    const songsPayload = await SongService.insertNewSongs(songs);
    const newSongs = songsPayload.data;

    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };
    // NEED to add song id array
    for (i = 0; i < newSongs.length; i++) {
      setDetails.songs.push(newSongs[i]._id);
    }
    // make new dj set with DjSetService with setDetails.
    const djSetPayload = await DjSetService.createNewSet(setDetails);
    // check response matches with set details.
    const data = djSetPayload.data;
    expect(data).toMatchObject(setDetails);
    const setSongs = data.songs;
    for (i = 0; i < setSongs.length; i++) {
      expect(setSongs[i]._id).toStrictEqual(newSongs[i]._id);
      expect(setSongs[i].title).toEqual(newSongs[i].title);
      expect(setSongs[i].artists).toEqual(newSongs[i].artists);
      expect(setSongs[i].album_id).toStrictEqual(newSongs[i].album_id);
    }
  });
});

describe("Service Function: createNewSet (bad request, missing required property)", () => {
  test("It should return missing property error message", async () => {
    let setDetails = {
      //title: "Andrew's First DJ Set",
      //creator: "Ando P",
      //is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };
    /* Special note, MongoDb accepts empty array as a correct value, hence 
    why no error message is show for the empty song array. However, 
    for our requirements an empty array is NOT allowed. This array 
    checking is done using our express-validators and djSetController. So,
    it is expected that the by the time the service layer is used, data will
    be properly formatted and validated. 
    
    This current test, tests the mongodb validation for its required properties,
    in this case the property "creator". 
    */

    const payload = await DjSetService.createNewSet(setDetails);
    const err = payload.err;
    expect(err).toBeDefined();
  });
});

describe("Service Function: getAllSets (expected non-empty response)", () => {
  test("It should return an array of dj sets", async () => {
    //
    // make an album for songs
    const albumDetails1 = {
      title: "The First Inc.",
      record_label: "Squid Inc.",
      label_number: "DIUQS21",
      artists: ["Mr.Squid", "Andrew"],
      tags: ["JAZZ", "RNB"],
    };

    // make an album for songs to belong to.
    let albumPayload = await AlbumDetailsService.createNewAlbumDetails(
      albumDetails1
    );
    // songs that will be used in the set.
    let songs = [
      {
        title: "Griddy Me",
        artists: ["Andrew 1", "Sun NY"],
      },
      {
        title: "Down bad",
        artists: ["An Tony", "ArcherWoo"],
      },
      {
        title: "Crazy Simps",
        artists: ["Dcho", "DH"],
      },
    ];
    // add album_id to the songs.
    for (i = 0; i < songs.length; i++) {
      songs[i].album_id = albumPayload.data._id;
    }
    // putting songs into database first.
    const songsPayload = await SongService.insertNewSongs(songs);
    const newSongs = songsPayload.data;

    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };
    // NEED to add song id array
    for (i = 0; i < newSongs.length; i++) {
      setDetails.songs.push(newSongs[i]._id);
    }
    // make new dj set with DjSetService with setDetails.
    const djSetPayload = await DjSetService.createNewSet(setDetails);

    // insertion of set is done. Now we check GET request response.
    const payload = await DjSetService.getAllSets();
    const djSet = djSetPayload.data;
    // getting array of results
    const results = payload.data;
    const resultSet = results[0];
    // maximum call stack error in jest, apparently old bug
    // have to check properties manually rather than toMatchObject().
    expect(resultSet._id).toStrictEqual(djSet._id);
    expect(resultSet.title).toEqual(djSet.title);
    expect(resultSet.creator).toEqual(djSet.creator);
    expect(resultSet.is_published).toEqual(djSet.is_published);
    expect(JSON.stringify(resultSet.tags)).toEqual(JSON.stringify(djSet.tags));
    expect(JSON.stringify(resultSet.songs)).toEqual(
      JSON.stringify(djSet.songs)
    );
  });
});

describe("Service Function: getAllSets (no dj sets in database)", () => {
  test("It should return an empty array [].", async () => {
    const payload = await DjSetService.getAllSets();
    const arr = payload.data;
    expect(arr.length).toEqual(0);
  });
});

describe("Service Function: getSetById (correct format)", () => {
  test("It should return a set with a matching id", async () => {
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    const payload = await DjSetService.createNewSet(setDetails);

    const id = payload.data._id;

    const myPayload = await DjSetService.getSetById(id);
    const data = myPayload.data;
    expect(data._id).toStrictEqual(id);
    expect(data).toMatchObject(setDetails);
  });
});

describe("Service Function: getSetById (Bad format, no matching id)", () => {
  test("It should return null", async () => {
    const id = "631782fd0e8ee3a4f3f86b4d";
    const payload = await DjSetService.getSetById(id);
    expect(payload.data).toBeNull();
  });
});

describe("Service Function: updateDjSetById (correct format)", () => {
  test("it should return a set with a matching id, and fields updated with the correct values", async () => {
    //inserting new set to update
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    const payload = await DjSetService.createNewSet(setDetails);

    const id = payload.data._id;

    //inserting songs into database
    const songData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
      {
        title: "Test2",
        artists: ["POST", "MAN"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
    ];

    const payload1 = await SongService.insertNewSongs(songData);

    //updating DJ Set
    const myPayload = await DjSetService.updateDjSetById(payload.data._id, {
      songs: [payload1.data[0]._id, payload1.data[1]._id],
      is_published: true,
      title: "New Set",
      creator: "Me",
      tags: ["Pop", "Rap", "Classical"],
    });

    expect(myPayload.err).not.toBeDefined;
    expect(myPayload.data._id).toEqual(id);
    expect(myPayload.data.title).toEqual("New Set");
    expect(myPayload.data.creator).toEqual("Me");
    expect(myPayload.data.is_published).toEqual(true);
    expect(myPayload.data.tags).toMatchObject(["Pop", "Rap", "Classical"]);
    expect(myPayload.data.songs).toMatchObject([
      payload1.data[0]._id,
      payload1.data[1]._id,
    ]);
  });
});

describe("Service Function: updateDjSetById (correct format, no update)", () => {
  test("it should return a set with no updated fields", async () => {
    //inserting new set to update
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    const payload = await DjSetService.createNewSet(setDetails);

    const id = payload.data._id;

    //updating DJ Set
    const myPayload = await DjSetService.updateDjSetById(payload.data._id, {});

    expect(myPayload.err).not.toBeDefined;
    expect(myPayload.data._id).toEqual(id);
    expect(myPayload.data.title).toEqual("Andrew's First DJ Set");
    expect(myPayload.data.creator).toEqual("Ando P");
    expect(myPayload.data.is_published).toEqual(false);
    expect(myPayload.data.tags).toMatchObject([
      "DEBUT",
      "REVOLUTIONARY",
      "AMATEUR",
    ]);
    expect(myPayload.data.songs).toMatchObject([]);
  });
});

describe("Service Function: updateDjSetById (bad format, no matching id)", () => {
  test("it should return a null", async () => {
    //inserting songs into database
    const songData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
      {
        title: "Test2",
        artists: ["POST", "MAN"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
    ];

    const payload1 = await SongService.insertNewSongs(songData);

    //updating DJ Set that does not exist
    const myPayload = await DjSetService.updateDjSetById(
      "631782fd0e8ee3a4f3f86b4d",
      {
        songs: [payload1.data[0]._id, payload1.data[1]._id],
        is_published: true,
        title: "New Set",
        creator: "Me",
        tags: ["Pop", "Rap", "Classical"],
      }
    );

    expect(myPayload.data).toBeNull;
  });
});

describe("Service Function: updateDjSetById (correct format, cannot update because is_published true)", () => {
  test("it should return an error, data is null, and should not update the set", async () => {
    //inserting new set to update
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: true,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    const songData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
      {
        title: "Test2",
        artists: ["POST", "MAN"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
    ];

    const payload1 = await SongService.insertNewSongs(songData);

    let newSetDetails = {
      title: "My Set",
      creator: "Me",
      is_published: false,
      tags: ["Pop", "Rap", "Classical"],
      songs: [payload1.data[0]._id, payload1.data[1]._id],
    };

    const payload = await DjSetService.createNewSet(setDetails);

    const id = payload.data._id;

    //updating DJ Set
    const myPayload = await DjSetService.updateDjSetById(
      payload.data._id,
      newSetDetails
    );

    expect(myPayload.err).toBeDefined;
    expect(myPayload.data).toBeNull;

    expect(payload.data._id).toEqual(id);
    expect(payload.data.title).toEqual("Andrew's First DJ Set");
    expect(payload.data.creator).toEqual("Ando P");
    expect(payload.data.is_published).toEqual(true);
    expect(payload.data.tags).toMatchObject([
      "DEBUT",
      "REVOLUTIONARY",
      "AMATEUR",
    ]);
    expect(payload.data.songs).toMatchObject([]);
  });
});

describe("Service Function: deleteDjSetById (Found Id)", () => {
  test("It should return the object: {'acknowledged':true, 'deletedCount':1}.", async () => {
    const songData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
      {
        title: "Test2",
        artists: ["POST", "MAN"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
    ];

    const payload1 = await SongService.insertNewSongs(songData);

    //inserting new set to delete
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: true,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [payload1.data[0]._id, payload1.data[1]._id],
    };

    const payload = await DjSetService.createNewSet(setDetails);

    const id = payload.data._id;

    //deleting DJ Set
    const myPayload = await DjSetService.deleteDjSetById(id);

    expect(myPayload.err).toBeNull;
    expect(myPayload.data).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});

describe("Service Function: deleteDjSetById (No Id found)", () => {
  test("It should return the object: {'acknowledged':true, 'deletedCount':1}.", async () => {
    const id = "631782fd0e8ee3a4f3f86b4d";

    //deleting DJ Set
    const myPayload = await DjSetService.deleteDjSetById(id);

    expect(myPayload.err).toBeDefined;
    expect(myPayload.data).toBeNull;
  });
});
