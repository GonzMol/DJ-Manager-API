const db = require("./db");
const request = require("supertest");
const app = require("../app");

// agent to mimick requests.
const agent = request.agent(app);

// setup connection to the database.
beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

describe("Good POST /api/album-details-with-songs (check songs)", () => {
  test("It should return status 201 and the newly created album details document", (done) => {
    agent
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
      })
      .expect(201)
      .then((res) => {
        const album_id = res.body.data.album_details._id;
        expect(res.body.data.songs[0].album_id).toBe(album_id);
        expect(res.body.data.songs[1].album_id).toBe(album_id);
        expect(res.body.data.songs[0]).toMatchObject({
          title: "I GOT SMOKE",
          artists: ["Tenzin", "Tsundue"]
        });
        expect(res.body.data.songs[1]).toMatchObject({
          title:"postmantest1",
          artists: ["post","man"]
        });
        done();
      });
  });
});

describe("Bad POST /api/album-details-with-songs (lack of song properties)", () => {
  test("It should return status 201 and the newly created album details document", (done) => {
    agent
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
                      ti: "I GOT SMOKE",
                      artists: ["Tenzin", "Tsundue"]
                  },
                  {
                      title:"postmantest1",
                      artists: ["post","man"]
                  }
              ]
          }
      })
      .expect(400)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        done();
      });
  });
});

describe("Good GET /api/songs/search , search for all songs", () => {
  test("It should return status 200 and the data of the matched songs", 
  async () => {

    const postRes = await agent
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
    });

    const album_id = postRes.body.data.album_details._id;

    await agent
      .get("/api/songs/search")
      .expect(200)
      .then((res) => {
        expect(res.body.data[0]).toMatchObject({
          title: "I GOT SMOKE",
          artists: ["Tenzin", "Tsundue"],
          album_id: album_id,
        });
        expect(res.body.data[0]._id).toBeDefined();
        
        expect(res.body.data[1]).toMatchObject({
          title: "postmantest1",
          artists: ["post", "man"],
          album_id: album_id,
        });
        expect(res.body.data[1]._id).toBeDefined();
      })
  });
});


describe("Good GET /api/songs/search?title=post , search for songs \
 that title start with post", () => {
  test("It should return status 200 and the data of the matched songs", 
  async () => {
    const postRes = await agent
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
    });

    const album_id = postRes.body.data.album_details._id;

    const title = "post";
    // searching an existing song
    await agent
      .get("/api/songs/search?title=" + title)
      .expect(200)
      .then((res) => {
        expect(res.body.data[0]).toMatchObject({
          title: "postmantest1",
          artists: ["post", "man"],
          album_id: album_id,
        });
        expect(res.body.data[0]._id).toBeDefined();
      })
  });
});

describe("BAD GET /api/songs/search?title=Beat it , search \
 for unexisting songs", () => {
  test("It should return status 404 and error message", async () => {
    await agent
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
    });

    const title = "Beat it";

    // Searching an unexisting song
    await agent
      .get("/api/songs/search?title=" + title)
      .expect(404)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.success).toBe(false);
      })
  });
});

describe("Good GET api/songs/album_id= , search for songs \
 with an dedicated album_id", () => {
  test("It should return status 200 and the data of the matched songs", 
  async () => {
    const postRes = await agent
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
    });

    const album_id = postRes.body.data.album_details._id;

    // searching an existing song with correct album_id
      
    await agent
      .get("/api/songs/album_id=" + album_id) 
      .expect(200)
      .then((res) => {
        expect(res.body.data[1]).toMatchObject({
          title: "postmantest1",
          artists: ["post", "man"],
          album_id: album_id,
        });
        expect(res.body.data[1]._id).toBeDefined();
      })
  });
});

describe("BAD GET /api/songs/album_id= , no songs are matched with an \
dedicated album_id", () => {
  test("It should return status 404 and error message", async () => {
    // Nothing in the database
    
    // no songs are matched
    await agent
      .get("/api/songs/album_id=631782fd0e8ee3a4f3f86b4d")
      .expect(404)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.success).toBe(false);
      })
  });
});