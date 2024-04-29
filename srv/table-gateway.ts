import * as cds from "@sap/cds";
import type { Product, RevenueRecognition, RecordSet } from "./table-module";

export class TableGateway extends cds.ApplicationService {
  async find(contractID: number): Promise<RecordSet> {
    const contracts = await SELECT.from("db.Contracts").where(
      `ID = ${contractID}`,
    );
    const products = await SELECT.from("db.Contracts")
      .where(`ID = ${contractID}`)
      .columns(
        "product.ID as ID",
        "product.name as name",
        "product.type as type",
      );
    const revenueRecognitions = await SELECT.from(
      "db.RevenueRecognitions",
    ).where(`contract.ID = ${contractID}`);

    const recordset = {
      Contracts: contracts,
      Products: products,
      RevenueRecognitions: revenueRecognitions,
    };
    return recordset;
  }
}
