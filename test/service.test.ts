import * as cds from "@sap/cds";

describe("Contracts", () => {
  const test = cds.test(cds.root);

  afterAll(async () => {
    (await test).server.close();
  });

  it("should return a revenue recognitions", async () => {
    const srv = await cds.connect.to("RevenueCalculationService");
    const recordset = await srv.run(
      SELECT.from(srv.entities.Contracts, (o: any) => {
        o.ID,
          o.whenSigned,
          o.Amount,
          o.product_ID,
          o.revenueRecognitions((r: any) => {
            r.items, r.amount, r.date, r.contract_ID;
          });
      }),
    );

    expect(recordset).toEqual([
      {
        Amount: 100,
        ID: "1",
        product_ID: 1,
        revenueRecognitions: [
          { amount: 30, contract_ID: "1", date: "2016-01-01", items: "1" },
          { amount: 70, contract_ID: "1", date: "2016-01-02", items: "2" },
        ],
        whenSigned: "2016-01-01",
      },
      {
        Amount: 200,
        ID: "2",
        product_ID: 2,
        revenueRecognitions: [
          { amount: 20, contract_ID: "2", date: "2016-01-03", items: "3" },
          { amount: 30, contract_ID: "2", date: "2016-01-04", items: "4" },
          { amount: 50, contract_ID: "2", date: "2016-01-05", items: "5" },
          { amount: 40, contract_ID: "2", date: "2016-01-06", items: "6" },
        ],
        whenSigned: "2016-02-01",
      },
    ]);
  });

  it("should allow to run action : calculateRecognitions", async () => {
    const srv = await cds.connect.to("RevenueCalculationService");
    await srv.send({
      event: "calculateRecognitions",
      entity: "Contracts",
      data: { contractID: 1 },
      params: { contractID: 1 },
    });
  });

  it("should allow to run action : calculateRecognitions", async () => {
    const srv = await cds.connect.to("RevenueCalculationService");
    await srv.send({
      event: "calculateRecognitions",
      entity: "Contracts",
      data: { contractID: 2 },
      params: { contractID: 2 },
    });
  });
});
