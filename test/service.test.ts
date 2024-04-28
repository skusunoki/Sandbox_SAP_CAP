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
        contracts: [
          {
            ID: 1,
            product_ID: 1,
            Amount: 100,
            whenSigned: "2016-01-01",
          },
        ],
        products: [
          {
            ID: 1,
            name: "Word Processer",
            type: "WP",
          },
        ],
        revenueRecognitions: [
          {
            ID: 1,
            contract_ID: 1,
            amount: 100,
            date: "2016-01-01",
          },
          {
            ID: 2,
            contract_ID: 1,
            amount: 200,
            date: "2016-01-01",
          },
        ],
      },
      {
        ID: 2,
        contracts: [
          {
            ID: 2,
            product_ID: 2,
            Amount: 200,
            whenSigned: "2016-01-01",
          },
        ],
        products: [
          {
            ID: 2,
            name: "Spread Sheet",
            type: "SS",
          },
        ],
        revenueRecognitions: [
          {
            ID: 3,
            contract_ID: 2,
            amount: 300,
            date: "2016-01-01",
          },
          {
            ID: 4,
            contract_ID: 2,
            amount: 400,
            date: "2016-01-01",
          },
        ],
      },
    ]);
  });
});
