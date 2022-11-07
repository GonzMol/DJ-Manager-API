const db = require("./db");
const request = require("supertest");
const app = require("../app");

// agent to mimick requests.
const agent = request.agent(app);

// setup connection to the database.
beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => {
  await db.close();
});

describe("Good POST /api/sets (Posting a new dj set)", () => {
  test("It should return status 201 and the newly created dj set document", async () => {
    
    const albumRes = await agent
    .post("/api/album-details-with-songs")
    .send({
        data: {
            album_details: {
                title: "Chaos Rules Them All",
                record_label: "EN",
                label_number: "LILRAT20",
                artists: ["Baelz Hakos", "Ando M"],
                tags: ["CHAOS", "DANCE"],
            },
            songs: [
                {
                    title: "I GOT SMOKE",
                    artists: ["Tenzin", "Tsundue"]
                },
                {
                    title:"postmantest1",
                    artists: ["post","man"]
                }
            ]
        }
    }).expect(201);
    
    const newSongs = albumRes.body.data.songs;
    // dj set to create
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };
    for (i = 0; i < newSongs.length; i++) {
      setDetails.songs.push(newSongs[i]._id);
    }

    // posting dj set
    const djSetRes = await agent.post("/api/sets").send({
      data: setDetails,
    });
    expect(djSetRes.body.success).toBe(true);
    const resSet = djSetRes.body.data;

    // check the response of dj set is as expected
    /* PLEASE NOTE:
      The array of songs in setDetails object created above are 
      mongoDB Object_id of songs.
      The array of songs in the response of posting dj set are 
      concrete song javscript objects
      To match the dj set reponse to over expectation, we have to
      modify the song property in our expectation as array of objects.
    */
    // modify song property in setDetails
    setDetails.songs = [];
    for (i = 0; i < newSongs.length; i++) {
      setDetails.songs.push(newSongs[i]);
    }
    expect(resSet).toMatchObject(setDetails);
  });
});

describe("Bad POST /api/sets (missing required property of a dj set)", () => {
  test("It should return status 400 and an error.", async () => {
    let setDetails = {
      //title: "Andrew's First DJ Set",
      //creator: "Ando P",
      //is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    const res = await agent
      .post("/api/sets")
      .send({
        data: setDetails,
      })
      .expect(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.success).toBe(false);
  });
});

describe("Good GET /api/sets/:id (correctly formatted and existing id)", () => {
  test("It should return status 200 and an set with matching id", async () => {
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    const res1 = await agent.post("/api/sets").send({
      data: setDetails,
    });

    const id = res1.body.data._id;

    const myRes = await agent.get("/api/sets/" + id).expect(200);
    const data = myRes.body.data;

    expect(data._id).toStrictEqual(id);
    expect(data).toMatchObject(setDetails);
  });
});

describe("Bad GET /api/sets/:id (correctly formatted but no matching id", () => {
  test("It should return status 404 and error message", async () => {
    const id = "631782fd0e8ee3a4f3f86b4d";
    const myRes = await agent.get("/api/sets/" + id).expect(404);
    expect(myRes.body.errors).toBeDefined();
    expect(myRes.body.errors).toEqual([
      { msg: "No set with id: " + id + " was found" },
    ]);
    expect(myRes.body.success).toBe(false);
  });
});

describe("Good POST /api/sets/id (updating an existing dj set)", () => {
  test("It should return status 200 and the newly updated dj set document", async () => {
    const albumRes = await agent
    .post("/api/album-details-with-songs")
    .send({
        data: {
            album_details: {
                title: "Chaos Rules Them All",
                record_label: "EN",
                label_number: "LILRAT20",
                artists: ["Baelz Hakos", "Ando M"],
                tags: ["CHAOS", "DANCE"],
            },
            songs: [
                {
                    title: "I GOT SMOKE",
                    artists: ["Tenzin", "Tsundue"]
                },
                {
                    title:"postmantest1",
                    artists: ["post","man"]
                }
            ]
        }
    }).expect(201);
    
    const newSongs = albumRes.body.data.songs;

    // dj set to create
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };
    for (i = 0; i < newSongs.length; i++) {
      setDetails.songs.push(newSongs[i]._id);
    }

    // posting dj set
    const djSetRes = await agent.post("/api/sets").send({
      data: setDetails,
    });

    const resSet = djSetRes.body.data;

    const setId = resSet._id;

    let updatedSetDetails = {
      title: "My Set",
      creator: "Me",
      is_published: true,
      tags: ["Pop", "Rap", "Classical"],
      songs: [newSongs[0]._id],
    };

    const newRes = await agent.post("/api/sets/" + setId).send({
      data: updatedSetDetails,
    });
    const newSet = newRes.body.data;
    expect(newSet._id).toEqual(setId);
    expect(newSet.title).toEqual("My Set");
    expect(newSet.creator).toEqual("Me");
    expect(newSet.is_published).toEqual(true);
    expect(newSet.tags).toMatchObject(["Pop", "Rap", "Classical"]);
    expect(newSet.songs).toMatchObject([newSongs[0]._id]);
  });
});

describe("Bad POST /api/sets/id (no matching id found)", () => {
  test("It should return status 400 and an error.", async () => {
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    const res = await agent
      .post("/api/sets/63413e173d45516f37b05ef8")
      .send({
        data: setDetails,
      })
      .expect(404);
    expect(res.body.errors).toBeDefined();
    expect(res.body.success).toBe(false);
  });
});

describe("Good DELETE /api/sets/id (id found)", () => {
  test("It should return status 200 and the newly updated dj set document", async () => {
    
    const albumRes = await agent
    .post("/api/album-details-with-songs")
    .send({
        data: {
            album_details: {
                title: "Chaos Rules Them All",
                record_label: "EN",
                label_number: "LILRAT20",
                artists: ["Baelz Hakos", "Ando M"],
                tags: ["CHAOS", "DANCE"],
            },
            songs: [
                {
                    title: "I GOT SMOKE",
                    artists: ["Tenzin", "Tsundue"]
                },
                {
                    title:"postmantest1",
                    artists: ["post","man"]
                }
            ]
        }
    }).expect(201);
    
    const newSongs = albumRes.body.data.songs;

    // dj set to create
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };
    for (i = 0; i < newSongs.length; i++) {
      setDetails.songs.push(newSongs[i]._id);
    }

    // posting dj set
    const djSetRes = await agent.post("/api/sets").send({
      data: setDetails,
    });

    const resSet = djSetRes.body.data;

    const setId = resSet._id;

    const newRes = await agent.delete("/api/sets/" + setId).send();

    expect(newRes.body.errors).toBeNull;
    expect(newRes.body).toMatchObject({
      success: true,
      data: { acknowledged: true, deletedCount: 1 },
    });
  });
});

describe("Bad DELETE /api/sets/id (no matching id found)", () => {
  test("It should return status 400 and an error.", async () => {
    const res = await agent
      .delete("/api/sets/63413e173d45516f37b05ef8")
      .send()
      .expect(404);
    expect(res.body.errors).toBeDefined();
    expect(res.body.success).toBe(false);
  });
});

describe("Good GET /api/sets (non-empty dj set collection)", () => {
  test("It should return a non-empty array of dj sets", async () => {
    let setDetails = {
      title: "Andrew's First DJ Set",
      creator: "Ando P",
      is_published: false,
      tags: ["DEBUT", "REVOLUTIONARY", "AMATEUR"],
      songs: [],
    };

    await agent.post("/api/sets").send({
      data: setDetails,
    });

    const myRes = await agent.get("/api/sets").expect(200);
    const data = myRes.body.data;
    expect(myRes.body.success).toBe(true);
    expect(data[0]).toMatchObject(setDetails);
  });
});

describe("Good GET /api/sets (empty dj set collection)", () => {
  test("It should return an empty array of dj sets", async () => {

    const myRes = await agent.get("/api/sets").expect(200);
    const data = myRes.body.data;
    expect(myRes.body.success).toBe(true);
    expect(data).toEqual([]);
  });
});