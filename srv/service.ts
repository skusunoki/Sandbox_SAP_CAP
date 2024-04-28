import * as cds from "@sap/cds";

export class Contracts extends cds.ApplicationService {
  init() {
    this.on("READ", "RecordSet", getData);
    this.on("requestData", getData);
    return super.init();
  }
}

async function getData(_req: any): Promise<RecordSet[]> {
  let gw = await cds.connect.to("TableGateway");
  const { Products, Contracts, RevenueRecognitions } = gw.entities;
  const contracts = await SELECT.from(Contracts);
  const products = await SELECT.from(Products);
  const revenueRecognitions = await SELECT.from(RevenueRecognitions);
  const dataset: DataSet = {
    Contracts: contracts,
    Products: products,
    RevenueRecognitions: revenueRecognitions,
  };

  let recordset = [];
  for (let contract of dataset.Contracts) {
    let product = dataset.Products.find((p) => p.ID === contract.product_ID);
    let revenueRecognitions = dataset.RevenueRecognitions.filter(
      (r) => r.contract_ID === contract.ID,
    );
    recordset.push({
      ID: contract.ID,
      whenSigned: contract.whenSigned,
      Amount: contract.Amount,
      ProductName: product?.name,
      RevenueRecognitions: revenueRecognitions,
    });
  }
  console.log(_req);
  return recordset;
}

type RecordSet = {
  ID: number;
  whenSigned: Date;
  Amount: number;
  ProductName: String | undefined;
  RevenueRecognitions: RevenueRecognition[];
};

export class TableModule<T> {
  protected _table: [T];
  public constructor(dataset: DataSet, tableName: Tables) {
    this._table = dataset[tableName] as [T];
  }
  public get table(): [T] {
    return this._table;
  }
  // public find(contractID: number) : cds.CQN {
  //     return SELECT.from(this._table).where(`ID = ${contractID}`);
  // }
}

export type Contract = {
  ID: number;
  whenSigned: Date;
  Amount: number;
  product_ID: number;
};

export type Product = {
  ID: number;
  name: String;
  type: String;
};

export type RevenueRecognition = {
  ID: number;
  amount: number;
  date: Date;
  contract_ID: number;
};

export class ContractImpl extends TableModule<Contract> {
  public constructor(dataset: DataSet) {
    super(dataset, "Contracts");
  }
}

export class ProductImpl extends TableModule<Product> {
  public constructor(dataset: DataSet) {
    super(dataset, "Products");
  }
}

export class RevenueRecognitionImpl extends TableModule<RevenueRecognition> {
  public constructor(dataset: DataSet) {
    super(dataset, "RevenueRecognitions");
  }
}

export type DataSet = {
  Contracts: [Contract];
  Products: [Product];
  RevenueRecognitions: [RevenueRecognition];
};

export type Tables = "Contracts" | "Products" | "RevenueRecognitions";
