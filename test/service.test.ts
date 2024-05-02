import * as cds from "@sap/cds";
import { Contracts } from "../srv/service";

describe("Contracts", () => {
  const test = cds.test(cds.root);

  afterAll(async () => {
    (await test).server.close();
  });
  beforeEach(async () => {
    await test.data.reset();
  });

  it("should return a revenue recognitions", async () => {
    const srv = await cds.connect.to("RevenueCalculationService");
    const recordset = await srv.run(
      SELECT.from(srv.entities.Contracts, (o: any) => {
        o.ID,
          o.whenSigned,
          o.amount,
          o.product_ID,
          o.revenueRecognitions((r: any) => {
            r.items, r.amount, r.date, r.contract_ID;
          });
      }),
    );

    expect(recordset).toEqual([
      {
        amount: 100,
        ID: 1,
        product_ID: 1,
        revenueRecognitions: [
          { amount: 30, contract_ID: 1, date: "2016-01-01", items: "1" },
          { amount: 70, contract_ID: 1, date: "2016-01-02", items: "2" },
        ],
        whenSigned: "2016-01-01",
      },
      {
        amount: 200,
        ID: 2,
        product_ID: 2,
        revenueRecognitions: [
          { amount: 20, contract_ID: 2, date: "2016-01-03", items: "3" },
          { amount: 30, contract_ID: 2, date: "2016-01-04", items: "4" },
          { amount: 50, contract_ID: 2, date: "2016-01-05", items: "5" },
          { amount: 40, contract_ID: 2, date: "2016-01-06", items: "6" },
        ],
        whenSigned: "2016-02-01",
      },
    ]);
  });

  it("should allow to run action : calculateRecognitions", async () => {
    await test.post(
      "/odata/v4/revenue-calculation/Contracts(1)/calculateRecognitions"
    );
    const { data } = await test.get(
      "/odata/v4/revenue-calculation/Contracts(1)?$expand=revenueRecognitions",
    );
    expect(data.revenueRecognitions.length).toEqual(1);
    expect(data.revenueRecognitions[0].amount).toEqual(100);
    expect(data.revenueRecognitions[0].contract_ID).toEqual(1);
    expect(data.revenueRecognitions[0].date).toEqual("2016-01-01");
  });

  it("should allow to run action : calculateRecognitions", async () => {
    await test.post(
      "/odata/v4/revenue-calculation/Contracts(2)/calculateRecognitions"
    );
    const { data } = await test.get(
      "/odata/v4/revenue-calculation/Contracts(2)?$expand=revenueRecognitions",
    );
    expect(data.revenueRecognitions.length).toEqual(3);
    expect(data.revenueRecognitions[0].amount).toEqual(66.67);
    expect(data.revenueRecognitions[1].amount).toEqual(66.67);
    expect(data.revenueRecognitions[2].amount).toEqual(66.66);
    expect(data.revenueRecognitions[0].contract_ID).toEqual(2);
    expect(data.revenueRecognitions[1].contract_ID).toEqual(2);
    expect(data.revenueRecognitions[2].contract_ID).toEqual(2);
    expect(data.revenueRecognitions[0].date).toEqual("2016-02-01");
    expect(data.revenueRecognitions[1].date).toEqual("2016-03-02");
    expect(data.revenueRecognitions[2].date).toEqual("2016-05-01");
  });
});
