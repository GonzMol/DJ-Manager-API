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

describe("Good POST /api/album-details-with-songs (check album_details)", () => {
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
        expect(res.body.data.album_details).toMatchObject({
          title: "Chaos Rules Them All",
          record_label: "EN",
          label_number: "LILRAT20",
          artists: ["Baelz Hakos", "Ando M"],
          tags: ["CHAOS", "DANCE"],
        });
        expect(res.body.data.album_details._id).toBeDefined();
        done();
      });
  });
});

describe("Bad POST /api/album-details-with-songs (wrong properties in albumdetails)", () => {
  test("It should return status 400 and an error", (done) => {
    agent
    .post("/api/album-details-with-songs")
    .send({
        data: {
            album_details: {
                ti: "Chaos Rules Them All",
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
      .expect(400)
      .then((res) => {
        expect(res.body.errors).toBeDefined();
        expect(res.body.success).toBe(false);
        done();
      });
  });
});

describe("Bad POST /api/album-details-with-songs (label_number already exists)", () => {
  test("It should return status 400 error, error message, and the existing album-details document.", async () => {
    const details = {
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
    };

    await agent.post("/api/album-details-with-songs").send({ data: details }).expect(201);

    // attempting to save another album details with same label number.
    const res = await agent.post("/api/album-details-with-songs").send({ data: details });
    expect(res.status).toEqual(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.success).toBe(false);
    expect(res.body.data).toMatchObject(details.album_details);
  });
});

describe("Good GET /api/album-details", () => {
  test("It should return status 200 and an array of album details. (2 album details)", async () => {
    //inserting albums to query.
    const res1 = await agent.post("/api/album-details-with-songs").send({
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
    const res2 = await agent.post("/api/album-details-with-songs").send({
      data: {
        album_details: {
            title: "The First Inc.",
            record_label: "Squid Inc.",
            label_number: "DIUQS21",
            artists: ["Mr.Squid", "Andrew"],
            tags: ["JAZZ", "RNB"],
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
    const myRes = await agent.get("/api/album-details").expect(200);
    const arr = myRes.body.data;
    expect(arr[0]).toStrictEqual(res1.body.data.album_details);
    expect(arr[1]).toStrictEqual(res2.body.data.album_details);
  });
});

describe("Bad GET /api/album-details", () => {
  test("It should return status 404 and an error message", async () => {
    const myRes = await agent.get("/api/album-details").expect(404);
    const errors = myRes.body.errors;
    expect(errors).toEqual([{ msg: "allalbumdetails collection is empty." }]);
  });
});

describe("Good GET /api/album-details/:id", () => {
  test("It should return status 200 and an album with specified id", async () => {
    const details = {
      album_details: {
        title: "The First Inc.",
        record_label: "Squid Inc.",
        label_number: "DIUQS21",
        artists: ["Mr.Squid", "Andrew"],
        tags: ["JAZZ", "RNB"],
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
    };

    const res1 = await agent.post("/api/album-details-with-songs").send({
      data: details,
    });

    const id = res1.body.data.album_details._id;

    const myRes = await agent.get("/api/album-details/" + id).expect(200);

    const data = myRes.body.data;

    expect(data._id).toEqual(id);
    expect(data).toMatchObject(details.album_details);
  });
});

describe("BAD GET /api/album-details/:id , (id does not exist)", () => {
  test("It should return status 404 and error message", async () => {
    const searched_id = "631782fd0e8ee3a4f3f86b4d";
    const myRes = await agent
      .get("/api/album-details/" + searched_id)
      .expect(404);
    expect(myRes.body.errors).toBeDefined();
    expect(myRes.body.errors).toEqual([
      { msg: "No album-details with id: " + searched_id + " was found." },
    ]);
  });
});

describe("Good Query GET /api/album-details/search?title=Andrew", () => {
  test("It should return an array of album-details with title", async () => {
    const title = "Andrew";
    //inserting albums to query.
    const res1 = await agent.post("/api/album-details-with-songs").send({
      data: {
        album_details: {
          title: "Andrew's First Album",
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
    const res2 = await agent.post("/api/album-details-with-songs").send({
      data: {
        album_details: {
          title: "The First Inc.",
          record_label: "Squid Inc.",
          label_number: "DIUQS21",
          artists: ["Mr.Squid", "Andrew"],
          tags: ["JAZZ", "RNB"],
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
    const res3 = await agent.post("/api/album-details-with-songs").send({
      data: {
          album_details: {
            title: "andrew's Second Album",
            record_label: "JP",
            label_number: "WTF2022",
            artists: ["Pika", "CHU CHU"],
            tags: ["YES", "WOW"],
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
      },
    });

    const myRes = await agent
      .get("/api/album-details/search?title=" + title)
      .expect(200);

    const arr = myRes.body.data;
    expect(arr[0]).toMatchObject(res1.body.data.album_details);
    expect(arr[1]).toMatchObject(res3.body.data.album_details);
  });
});

describe("Bad Query no matching title found, GET /api/album-details/search?title=Andrew", () => {
  test("It should return an array of album-details with title", async () => {
    const title = "Andrew";
    //inserting albums to query.
    const res1 = await agent.post("/api/album-details").send({
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

    const myRes = await agent
      .get("/api/album-details/search?title=" + title)
      .expect(404);
    expect(myRes.body.errors).toEqual([
      { msg: 'No album-details with the title: "' + title + '" was found.' },
    ]);
  });
});

describe("BAD DELETE /api/album-details/:id , (id does not exist)", () => {
  test("It should return status 404 and error message", async () => {
    const searched_id = "631782fd0e8ee3a4f3f86b4d";
    const myRes = await agent
      .delete("/api/album-details/" + searched_id)
      .expect(404);
    expect(myRes.body.errors).toBeDefined();
    expect(myRes.body.errors).toEqual([
      { msg: "No album-details with id: " + searched_id + " was found." },
    ]);
  });
});

describe("Good DELETE /api/album-details/:id", () => {
  test("It should return status 200 and details relating to the album deleted", async () => {
    //inserting album details to delete
    const details1 = {
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
    };

    const res1 = await agent.post("/api/album-details-with-songs").send({
      data: details1,
    });

    const details2 = {
      album_details: {
        title: "The First Inc.",
        record_label: "Squid Inc.",
        label_number: "DIUQS21",
        artists: ["Mr.Squid", "Andrew"],
        tags: ["JAZZ", "RNB"],
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
    };

    const res2 = await agent.post("/api/album-details-with-songs").send({
      data: details2,
    });

    const id1 = res1.body.data.album_details._id;
    const id2 = res2.body.data.album_details._id;

    //deleting album with id1
    const myRes1 = await agent.delete("/api/album-details/" + id1).expect(200);

    const data1 = myRes1.body.data;
    //Checking correct response for deleteAlbumDetailsbyId
    expect(data1).toMatchObject({ acknowledged: true, deletedCount: 1 });

    //checking albumdetails have been deleted
    const myRes2 = await agent.get("/api/album-details/" + id1).expect(404);
    expect(myRes2.body.errors).toBeDefined();
    expect(myRes2.body.errors).toEqual([
      { msg: "No album-details with id: " + id1 + " was found." },
    ]);

    //checking other albumdetails are untouched
    const myRes3 = await agent.get("/api/album-details/" + id2).expect(200);

    const data3 = myRes3.body.data;

    expect(data3._id).toEqual(id2);
    expect(data3).toMatchObject(details2.album_details);
  });
});

describe("Bad DELETE /api/album-details/:id", () => {
  test("It should return status 400 and details of the conflicts\
 between this album detail and some dj sets", async () => {
    const albumDetailsAndSongs1 = {
      album_details: {
        title: "The First Inc.",
        record_label: "Squid Inc.",
        label_number: "DIUQS21",
        artists: ["Mr.Squid", "Andrew"],
        tags: ["JAZZ", "RNB"],
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
    };
    // posting album with its songs
    const albumRes = await agent.post("/api/album-details-with-songs").send({
      data: albumDetailsAndSongs1,
    });

    // The id of this album_detail will be used later
    const album_id = albumRes.body.data.album_details._id;
    
    // array of new created song documents.
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

    // deleting album with id1 expect 400 and errors is a array with length 2
    const res2 = await agent
      .delete("/api/album-details/" + album_id)
      .expect(400);
    expect(res2.body.errors.length).toEqual(2);
  });
});

describe("Good GET /api/album-details/search/label-number:num", () => {
  test("It should return status 200 and an album with specified label number", async () => {
    const albumDetailsAndSongs = {
      album_details: {
        title: "The First Inc.",
        record_label: "Squid Inc.",
        label_number: "DIUQS21",
        artists: ["Mr.Squid", "Andrew"],
        tags: ["JAZZ", "RNB"],
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
    };
    // posting album with its songs
    await agent.post("/api/album-details-with-songs").send({
      data: albumDetailsAndSongs,
    }).expect(201);

    const label_number = albumDetailsAndSongs.album_details.label_number

    const myRes = await agent.get("/api/album-details/search/label-number\
" + label_number).expect(200);

    const data = myRes.body.data;

    expect(data.label_number).toEqual(label_number);
    expect(data).toMatchObject(albumDetailsAndSongs.album_details);
  });
});

describe("BAD GET /api/album-details/search/label-number:num ,\
 (label number does not exist)", () => {
  test("It should return status 404 and error message", async () => {
    const searchedLabelNum = "NOLABELNUMBERLMAO";
    const myRes = await agent
      .get("/api/album-details/search/label-number" + searchedLabelNum)
      .expect(404);
    expect(myRes.body.errors).toBeDefined();
    expect(myRes.body.errors).toEqual([
      { msg: "No album-details with label number: " + searchedLabelNum + " was found." },
    ]);
  });
});