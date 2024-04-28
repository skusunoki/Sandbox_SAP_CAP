import * as cds from "@sap/cds";

export class Contracts extends cds.ApplicationService {
  init() {
    this.on("READ", "RecordSet", getData);
    return super.init();
  }
}

async function getData(_req: any): Promise<RecordSet[]> {
  let gw = await cds.connect.to("TableGateway");
  const { Products, Contracts, RevenueRecognitions } = gw.entities;
  const contracts = await SELECT.from(Contracts);
  const products = await SELECT.from(Products);
  const revenueRecognitions = await SELECT.from(RevenueRecognitions);

  let recordset = [];
  for (let aContract of contracts) {
    let aProduct = products.find((p: Product) => p.ID === aContract.product_ID);
    let subsetOfRevenueRecognitions = revenueRecognitions.filter(
      (r: RevenueRecognition) => r.contract_ID === aContract.ID,
    );
    recordset.push({
      ID: aContract.ID,
      contracts: [aContract],
      products: [aProduct],
      revenueRecognitions: subsetOfRevenueRecognitions,
    });
  }
  console.log(_req);
  return recordset;
}

type RecordSet = {
  ID: number;
  contracts: Contract[];
  products: (Product | undefined)[] | [];
  revenueRecognitions: RevenueRecognition[];
};

export class TableModule<T> {
  protected _table: [T];
  public constructor(dataset: DataSet, tableName: Tables) {
    this._table = dataset[tableName] as [T];
  }
  public get table(): [T] {
    return this._table;
  }
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
