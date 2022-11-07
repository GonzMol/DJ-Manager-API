/**
 * This file is test cases of epic 1.6: Uploading songs associated with an
 * album.
 */

const db = require("./db");
const songService = require("../services/songService");
// setup connection to the database.
beforeAll(async () => await db.connect());
// clear mimic server before each tests
beforeEach(async () => await db.clear());
// disconnect database, close the mimic server
afterAll(async () => await db.close());

/* Test cases */

describe("Service Function: insertNewSongs (correct request)", () => {
  test("It should return newly inserted song.", async () => {
    const reqData = [
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

    const payload = await songService.insertNewSongs(reqData);
    const data = payload.data;
    expect(data[0].title).toBe(reqData[0].title);
    expect(data[0].artists).toStrictEqual(reqData[0].artists);
    expect(data[0].album_id.toString()).toBe(reqData[0].album_id);
    expect(data[1].title).toBe(reqData[1].title);
    expect(data[1].artists).toStrictEqual(reqData[1].artists);
    expect(data[1].album_id.toString()).toBe(reqData[1].album_id);
  });
});

describe("Service Function: insertNewSong (bad request, \
 illegal album_id)", () => {
  test("Error should be given.", async () => {
    const reqData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
      {
        title: "Test2",
        artists: ["POST", "MAN"],
        album_id: "88888",
      },
    ];

    const payload = await songService.insertNewSongs(reqData);
    const err = payload.err;
    expect(err).toBeDefined();
  });
});

describe("Service Function: insertNewSong (bad request, \
 lack of property other than artists)", () => {
  test("Error should be given", async () => {
    const reqData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        // album_id: "631782fd0e8ee3a4f3f86b4d",
      },
    ];

    const payload = await songService.insertNewSongs(reqData);
    const err = payload.err;
    expect(err).toBeDefined();
  });
});

describe("Service Function: findSongsByProperty (correct request)", () => {
  test("It should return the matched songs in database.", async () => {
    const reqData = [
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

    await songService.insertNewSongs(reqData);

    const query1 = { title: "i got", artist: "T" };
    const payload1 = await songService.findSongsByProperty(query1);
    const data = payload1.data;
    expect(data[0].title).toBe(reqData[0].title);
    expect(data[0].artists).toStrictEqual(reqData[0].artists);
    expect(data[0].album_id.toString()).toBe(reqData[0].album_id);

    const query2 = { artist: "ma", title: "" };
    const payload2 = await songService.findSongsByProperty(query2);
    const data2 = payload2.data;
    expect(data2[0].title).toBe(reqData[1].title);
    expect(data2[0].artists).toStrictEqual(reqData[1].artists);
    expect(data2[0].album_id.toString()).toBe(reqData[1].album_id);
  });
});

describe("Service Function: findSongsByProperty (songs not found)", () => {
  test("It should return an empty array [].", async () => {
    const reqData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
    ];

    await songService.insertNewSongs(reqData);

    // This query1 here is searching songs that don't exist in database
    const query1 = { title: "Beat it", artist: "" };
    const payload1 = await songService.findSongsByProperty(query1);
    const data = payload1.data;
    expect(data.length).toEqual(0);
  });
});

describe("Service Function: findSongsByProperty (correct request)", () => {
  test("It should return the matched songs in database.", async () => {
    const reqData = [
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

    await songService.insertNewSongs(reqData);

    // note: query has undefined value, in this case
    // service function should treat it as "" value.
    const query1 = { title: "i got", artist: undefined };
    const payload1 = await songService.findSongsByProperty(query1);
    const data = payload1.data;
    expect(data[0].title).toBe(reqData[0].title);
    expect(data[0].artists).toStrictEqual(reqData[0].artists);
    expect(data[0].album_id.toString()).toBe(reqData[0].album_id);

    const query2 = { artist: "ma", title: undefined };
    const payload2 = await songService.findSongsByProperty(query2);
    const data2 = payload2.data;
    expect(data2[0].title).toBe(reqData[1].title);
    expect(data2[0].artists).toStrictEqual(reqData[1].artists);
    expect(data2[0].album_id.toString()).toBe(reqData[1].album_id);
  });
});

describe("Service Function: getSongByAlbumId (correct request)", () => {
  test("It should return the matched songs in database.", async () => {
    const reqData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782970e8ee3a4f3f86b4a",
      },
      {
        title: "Test2",
        artists: ["POST", "MAN"],
        album_id: "631782fd0e8ee3a4f3f86b4d",
      },
    ];

    await songService.insertNewSongs(reqData);

    const album_id1 = "631782970e8ee3a4f3f86b4a";
    const payload1 = await songService.getSongByAlbumId(album_id1);
    const data = payload1.data;
    expect(data[0].title).toBe(reqData[0].title);
    expect(data[0].artists).toStrictEqual(reqData[0].artists);
    expect(data[0].album_id.toString()).toBe(reqData[0].album_id);

    const album_id2 = "631782fd0e8ee3a4f3f86b4d";
    const payload2 = await songService.getSongByAlbumId(album_id2);
    const data2 = payload2.data;
    expect(data2[0].title).toBe(reqData[1].title);
    expect(data2[0].artists).toStrictEqual(reqData[1].artists);
    expect(data2[0].album_id.toString()).toBe(reqData[1].album_id);
  });
});

describe("Service Function: getSongByAlbumId (songs not found)", () => {
  test("It should return an empty array [].", async () => {
    const reqData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: "631782970e8ee3a4f3f86b4a",
      },
    ];

    await songService.insertNewSongs(reqData);

    // This album_id1 here is searching songs that don't exist in database
    const album_id1 = "631782fd0e8ee3a4f3f86b4d";
    const payload1 = await songService.getSongByAlbumId(album_id1);
    const data = payload1.data;
    expect(data.length).toEqual(0);
  });
});

describe("Service Function: deleteSongByAlbumId", () => {
  test("Songs with the dedicated album id should be deleted.", async () => {
    const album_id = "631782970e8ee3a4f3f86b4a";
    const reqData = [
      {
        title: "I GOT SMOKE",
        artists: ["Tenzin", "Tsundue"],
        album_id: album_id,
      },
      {
        title: "Test2",
        artists: ["POST", "MAN"],
        album_id: album_id,
      },
    ];

    const { data, err } = await songService.insertNewSongs(reqData);
    expect(data.length).toEqual(2);

    await songService.deleteSongByAlbumId(album_id);

    // Serach the songs with this album_id, no songs should be returned
    const payload = await songService.getSongByAlbumId(album_id);
    const data2 = payload.data;
    expect(data2.length).toEqual(0);
  });
});
