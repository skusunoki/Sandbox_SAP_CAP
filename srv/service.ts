import * as cds from "@sap/cds";
import type {
  Contract as ContractType,
  Product,
  RecordSet,
  RevenueRecognition,
} from "./table-module";
import { ContractImpl } from "./table-module";

export class ContractService extends cds.ApplicationService {
  init() {
    this.on("READ", "Contracts", getContracts);
    this.on("READ", "Products", getProducts);
    this.on("READ", "RevenueRecognitions", getRevenueRecognitions);
    return super.init();
  }
}

async function getContracts(req: any): Promise<[ContractType]> {
  const gw = await cds.connect.to("TableGateway");
  const [args] = req.params.length === 0 ? [1] : req.params;
  const recordset = await gw.send("find", { contractID: args });
  return recordset.Contracts;
}

async function getProducts(req: any): Promise<[Product]> {
  const gw = await cds.connect.to("TableGateway");
  const [args] = req.params.length === 0 ? [1] : req.params;
  const recordset = await gw.send("find", { contractID: args });
  console.log(recordset);
  return recordset.Products;
}

async function getRevenueRecognitions(req: any): Promise<[RevenueRecognition]> {
  const gw = await cds.connect.to("TableGateway");
  const [args] = req.params.length === 0 ? [1] : req.params;
  const recordset = await gw.send("find", { contractID: args });
  console.log(recordset);

  return recordset.RevenueRecognitions;
}
