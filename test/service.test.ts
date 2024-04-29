import * as cds from "@sap/cds";

describe("Contracts", () => {
  const test = cds.test(cds.root);

  afterAll(async () => {
    (await test).server.close();
  });

  it("should return a contract", async () => {
    const srv = await cds.connect.to("ContractService");
    const recordset = await srv.get(srv.entities.Contracts, { ID: 1 });
    expect(recordset).toEqual([
      {
        ID: 1,
        product_ID: 1,
        Amount: 100,
        whenSigned: "2016-01-01",
      },
    ]);
  });

  it("should return a product", async () => {
    const srv = await cds.connect.to("ContractService");
    const recordset = await srv.get(srv.entities.Products, { ID: 1 });
    expect(recordset).toEqual([
      {
        ID: 1,
        name: "Word Processor",
        type: "WP",
      },
    ]);
  });

  it("should return a revenue recognition", async () => {
    const srv = await cds.connect.to("ContractService");
    const recordset = await srv.get(srv.entities.RevenueRecognitions, { ID: 1 });
    expect(recordset).toEqual([
      {
        ID: 1,
        amount: 100,
        date: "2016-01-01",
        contract_ID: 1,
      },
      {
        ID: 2,
        amount: 200,
        date: "2016-01-01",
        contract_ID: 1,
      },
    ]);
  })
});
