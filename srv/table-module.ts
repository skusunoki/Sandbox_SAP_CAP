export type RecordSet = {
  Contracts: Contract[];
  Products: (Product | undefined)[] | [];
  RevenueRecognitions: RevenueRecognition[];
};

export class TableModule<T> {
  protected _table: [T];
  public constructor(recordset: RecordSet, tableName: Tables) {
    this._table = recordset[tableName] as [T];
  }
  public get table(): [T] {
    return this._table;
  }
  public set table(value: [T]) {
    this._table = value;
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
  private _products: ProductImpl;
  private _revenueRecognitions: RevenueRecognitionImpl;
  public constructor(recordset: RecordSet) {
    super(recordset, "Contracts");
    this._products = new ProductImpl(recordset);
    this._revenueRecognitions = new RevenueRecognitionImpl(recordset);
    this.recalculate();
  }
  private recalculate() {
    //  this.table[0].Amount = this._revenueRecognitions.table.reduce((acc, rr) => acc + rr.amount, 0);
    //  console.log( this._revenueRecognitions.table.reduce((acc, rr) => acc + rr.amount, 0))
  }
}

export class ProductImpl extends TableModule<Product> {
  public constructor(recordset: RecordSet) {
    super(recordset, "Products");
  }
}

export class RevenueRecognitionImpl extends TableModule<RevenueRecognition> {
  public constructor(recordset: RecordSet) {
    super(recordset, "RevenueRecognitions");
  }
}

export type Tables = "Contracts" | "Products" | "RevenueRecognitions";
