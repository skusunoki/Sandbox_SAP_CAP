import * as cds from "@sap/cds";

describe("Contracts", () => {
  const test = cds.test(cds.root);

  afterAll(async () => {
    (await test).server.close();
  });

  it("should return a recordset", async () => {
    const srv = await cds.connect.to("Contracts");
    const recordset = await srv.get(srv.entities.RecordSet);
    expect(recordset).toEqual([
      {
        ID: 1,
        whenSigned: "2016-01-01",
        Amount: 100,
        ProductName: "Word Processer",
        RevenueRecognitions: [
          {
            ID: 1,
            amount: 100,
            contract_ID: 1,
            date: "2016-01-01",
          },
          {
            ID: 2,
            amount: 200,
            contract_ID: 1,
            date: "2016-01-01",
          },
        ],
      },
      {
        ID: 2,
        whenSigned: "2016-01-01",
        Amount: 200,
        ProductName: "Spread Sheet",
        RevenueRecognitions: [
          {
            ID: 3,
            amount: 300,
            contract_ID: 2,
            date: "2016-01-01",
          },
          {
            ID: 4,
            amount: 400,
            contract_ID: 2,
            date: "2016-01-01",
          },
        ],
      },
    ]);
  });
});
