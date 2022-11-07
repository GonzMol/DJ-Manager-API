const db = require("./db");
const AlbumDetailsService = require("../services/albumDetailsService");
// setup connection to the database.
beforeAll(async () => await db.connect());
beforeEach(async () => await db.clear());
afterAll(async () => await db.close());

describe("Service Function: createNewAlbumDetails (correct request)", () => {
  test("It should return newly created document.", async () => {
    const details = {
      title: "Chaos Rules Them All",
      record_label: "EN",
      label_number: "LILRAT20",
      artists: ["Baelz Hakos", "Ando M"],
      tags: ["CHAOS", "DANCE"],
    };

    const payload = await AlbumDetailsService.createNewAlbumDetails(details);
    const data = payload.data;
    expect(data).toMatchObject(details);
  });
});

describe("Service Function: createNewAlbumDetails (Bad Request)", () => {
  test("It should return missing label_number error message", async () => {
    const details = {
      title: "Chaos Rules Them All",
      record_label: "EN",
      //label_number: "LILRAT20",
      artists: ["Baelz Hakos", "Ando M"],
      tags: ["CHAOS", "DANCE"],
    };

    const payload = await AlbumDetailsService.createNewAlbumDetails(details);
    const err = payload.err;
    expect(err).toBeDefined();
  });
});

describe("Service Function: getAllAlbumDetails (expected non-empty response)", () => {
  test("It should return an array of album-details", async () => {
    // adding album-details to query.
    const details = {
      title: "Chaos Rules Them All",
      record_label: "EN",
      label_number: "LILRAT20",
      artists: ["Baelz Hakos", "Ando M"],
      tags: ["CHAOS", "DANCE"],
    };
    const details2 = {
      title: "Rolling Thunder",
      record_label: "CROWS",
      label_number: "LILGIANT7",
      artists: ["Yamaguchi", "Daichi"],
    };

    const payload1 = await AlbumDetailsService.createNewAlbumDetails(details);
    const data1 = payload1.data;
    const payload2 = await AlbumDetailsService.createNewAlbumDetails(details2);
    const data2 = payload2.data;

    const myPayload = await AlbumDetailsService.getAllAlbumDetails();

    const arr = myPayload.data;
    // checking _id will suffice as this is sent with every document.
    expect(arr[0]._id).toEqual(data1._id);
    expect(arr[1]._id).toEqual(data2._id);
  });
});

describe("Service Function: getAllAlbumDetails (no album-details in database)", () => {
  test("It should return an empty array [].", async () => {
    const myPayload = await AlbumDetailsService.getAllAlbumDetails();
    const arr = myPayload.data;
    expect(arr.length).toEqual(0);
  });
});

describe("Service Function: getAlbumDetailsById (Correct request)", () => {
  test("It should return the correct album-details with matching id", async () => {
    //
    const details = {
      title: "Chaos Rules Them All",
      record_label: "EN",
      label_number: "LILRAT20",
      artists: ["Baelz Hakos", "Ando M"],
      tags: ["CHAOS", "DANCE"],
    };
    const payload1 = await AlbumDetailsService.createNewAlbumDetails(details);
    const id = payload1.data._id;
    const myPayload = await AlbumDetailsService.getAlbumDetailsById(id);
    const data = myPayload.data;
    // checking for _id should suffice for checking.
    expect(data._id).toEqual(id);
    expect(data.title).toEqual(details.title);
  });
});

describe("Service Function: getAlbumDetailsById (Bad Request)", () => {
  test("It should return null.", async () => {
    //
    const id = "631782fd0e8ee3a4f3f86b4d";
    const myPayload = await AlbumDetailsService.getAlbumDetailsById(id);
    expect(myPayload.data).toBeNull();
  });
});

describe("Service Function: searchAlbumDetailsByTitle (Found title)", () => {
  test("It should return an array of album-details with title", async () => {
    const title = "Andrew";
    //inserting albums to query.
    const details1 = {
      title: "Andrew's First Album",
      record_label: "EN",
      label_number: "LILRAT20",
      artists: ["Baelz Hakos", "Ando M"],
      tags: ["CHAOS", "DANCE"],
    };
    const details2 = {
      title: "The First Inc.",
      record_label: "Squid Inc.",
      label_number: "DIUQS21",
      artists: ["Mr.Squid", "Andrew"],
      tags: ["JAZZ", "RNB"],
    };
    const details3 = {
      title: "andrew's Second Album",
      record_label: "JP",
      label_number: "WTF2022",
      artists: ["Pika", "CHU CHU"],
      tags: ["YES", "WOW"],
    };
    const payload1 = await AlbumDetailsService.createNewAlbumDetails(details1);
    const payload2 = await AlbumDetailsService.createNewAlbumDetails(details2);
    const payload3 = await AlbumDetailsService.createNewAlbumDetails(details3);

    const myPayload = await AlbumDetailsService.searchAlbumDetailsbyTitle(
      title
    );

    const arr = myPayload.data;
    expect(arr[0]._id).toEqual(payload1.data._id);
    expect(arr[1]._id).toEqual(payload3.data._id);
  });
});

describe("Service Function: searchAlbumDetailsByTitle (No matching title found)", () => {
  test("It should return an empty array [].", async () => {
    const title = "Andrew";
    //inserting albums to query.
    const details = {
      title: "The First Inc.",
      record_label: "Squid Inc.",
      label_number: "DIUQS21",
      artists: ["Mr.Squid", "Andrew"],
      tags: ["JAZZ", "RNB"],
    };
    const payload1 = await AlbumDetailsService.createNewAlbumDetails(details);

    const myPayload = await AlbumDetailsService.searchAlbumDetailsbyTitle(
      title
    );
    expect(myPayload.data.length).toEqual(0);
  });
});

describe("Service Function: getAlbumDetailsByLabelNumber (found matching label number).", () => {
  test("It should return album details with desired label number.", async () => {
    const details = {
      title: "The First Inc.",
      record_label: "Squid Inc.",
      label_number: "DIUQS21",
      artists: ["Mr.Squid", "Andrew"],
      tags: ["JAZZ", "RNB"],
    };

    await AlbumDetailsService.createNewAlbumDetails(details);
    const payload = await AlbumDetailsService.getAlbumDetailsByLabelNumber(
      details.label_number
    );
    expect(payload.data.label_number).toEqual(details.label_number);
  });
});

describe("Service Function: getAlbumDetailsByLabelNumber (no matching label number).", () => {
  test("It should return no data", async () => {
    const details = {
      title: "The First Inc.",
      record_label: "Squid Inc.",
      label_number: "DIUQS21",
      artists: ["Mr.Squid", "Andrew"],
      tags: ["JAZZ", "RNB"],
    };

    await AlbumDetailsService.createNewAlbumDetails(details);
    const payload = await AlbumDetailsService.getAlbumDetailsByLabelNumber(
      "NOLABELNUMBERLMAO"
    );
    expect(payload.data).toBeNull();
  });
});

describe("Service Function: deleteAlbumById (Found Id)", () => {
  test("It should return the object: {'acknowledged':true, 'deletedCount':1}.", async () => {
    //inserting albums to delete
    const details = {
      title: "Andrew's First Album",
      record_label: "EN",
      label_number: "LILRAT20",
      artists: ["Baelz Hakos", "Ando M"],
      tags: ["CHAOS", "DANCE"],
    };

    const payload1 = await AlbumDetailsService.createNewAlbumDetails(details);

    const id = payload1.data._id;
    //deleting albumDetails
    const myPayload = await AlbumDetailsService.deleteAlbumDetailsbyId(id);
    //attempting to get album details from the deleted albumDetails (should be null)
    const myPayload2 = await AlbumDetailsService.getAlbumDetailsById(id);
    //Checking return output is correct
    expect(myPayload.data).toEqual({ acknowledged: true, deletedCount: 1 });
    //Checking that albumDetails have actually been deleted
    expect(myPayload2.data).toBeNull;
  });
});

describe("Service Function: deleteAlbumById (bad request)", () => {
  test("It should return the object: {'acknowledged':true, 'deletedCount':0}.", async () => {
    const id = "631782fd0e8ee3a4f3f86b4d";
    //deleting albumDetails
    const myPayload = await AlbumDetailsService.deleteAlbumDetailsbyId(id);
    //Checking return output is correct
    expect(myPayload.data).toEqual({ acknowledged: true, deletedCount: 0 });
  });
});
