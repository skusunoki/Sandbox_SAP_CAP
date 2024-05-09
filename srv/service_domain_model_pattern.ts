import cds from "@sap/cds";
import assert from "power-assert";

class Currency {
  private _code: string;
  private _fractionDigits: number;
  constructor(code: string, fractionDigits: number) {
    this._code = code;
    this._fractionDigits = fractionDigits;
  }
  public static USD() {
    return new Currency("USD", 2);
  }
  public getDefaultFractionDigits(): number {
    return this._fractionDigits;
  }
  public get code(): string {
    return this._code;
  }
}

class Money {
  private _amount: bigint;
  private _currency: Currency;
  constructor(amount: number, currency: Currency) {
    this._currency = currency;
    this._amount = BigInt(Math.round(amount * this.centFactor()));
  }
  private static get cents(): number[] {
    return [1, 10, 100, 1000];
  }
  public centFactor(): number {
    assert(this._currency !== undefined, "Currency must be defined");
    return Money.cents[this._currency.getDefaultFractionDigits()];
  }
  public static dollars(amount: number): Money {
    assert(amount >= 0, "Amount must be greater than or equal to 0");
    return new Money(amount, Currency.USD());
  }
  public amount(): { amount_internal: bigint; fractionDigits: number } {
    return {
      amount_internal: this._amount,
      fractionDigits: this._currency.getDefaultFractionDigits(),
    };
  }
  public currency(): Currency {
    return this._currency;
  }
  public newMoney(amount: { amount_internal: bigint; fractionDigits: number }) {
    return new Money(
      Number(amount.amount_internal) / Money.cents[amount.fractionDigits],
      this.currency(),
    );
  }

  public allocate(by: number): Money[] {
    const lowResult = this.devide(by);
    const highResult = lowResult.add(
      new Money(1 / this.centFactor(), this.currency()),
    );
    const result = [];
    let remainder = this.amount().amount_internal % BigInt(by);
    for (let i = BigInt(0); i < BigInt(by); i++) {
      result.push(i < remainder ? highResult : lowResult);
    }
    return result;
  }

  public devide(by: number): Money {
    return this.newMoney({
      amount_internal: this.amount().amount_internal / BigInt(by),
      fractionDigits: this.amount().fractionDigits,
    });
  }

  public multiply(by: number): Money {
    return this.newMoney({
      amount_internal: this.amount().amount_internal * BigInt(by),
      fractionDigits: this.amount().fractionDigits,
    });
  }

  public add(money: Money): Money {
    return this.newMoney({
      amount_internal:
        this.amount().amount_internal + money.amount().amount_internal,
      fractionDigits: this.amount().fractionDigits,
    });
  }

  public subtract(money: Money): Money {
    return this.newMoney({
      amount_internal:
        this.amount().amount_internal - money.amount().amount_internal,
      fractionDigits: this.amount().fractionDigits,
    });
  }
}

class Product {
  private _ID: number;
  private _name: string;
  private _type: string;
  private _recognitionStrategy: RecognitionsStrategy;

  constructor(
    ID: number,
    name: string,
    type: string,
    recognitionStrategy: RecognitionsStrategy,
  ) {
    this._ID = ID;
    this._name = name;
    this._type = type;
    this._recognitionStrategy = recognitionStrategy;
  }
  public calculateRecognitions(contract: Contract): RevenueRecognition[] {
    return this._recognitionStrategy.calculateRecognitions(contract);
  }
  public static factoryWordProcessor(): Product {
    return new Product(
      1,
      "Word Processor",
      "WP",
      new CompletedRecognitionsStrategy(),
    );
  }
  public static factorySpreadsheet(): Product {
    return new Product(
      2,
      "Spreadsheet",
      "SS",
      new ThreeWayRecognitionsStrategy(30, 60),
    );
  }
  public static factoryUndefinedProduct(): Product {
    throw new Error("Product type is not defined");
  }
  public static factoryProduct(type: "WP" | "SS" | undefined): Product {
    return type === "WP"
      ? Product.factoryWordProcessor()
      : type === "SS"
        ? Product.factorySpreadsheet()
        : Product.factoryUndefinedProduct();
  }
  get type(): string {
    return this._type;
  }
  get ID(): number {
    return this._ID;
  }
  get name(): string {
    return this._name;
  }
}

interface RecognitionsStrategy {
  calculateRecognitions(contract: Contract): RevenueRecognition[];
}

class CompletedRecognitionsStrategy implements RecognitionsStrategy {
  calculateRecognitions(contract: Contract): RevenueRecognition[] {
    return [new RevenueRecognition(contract.amountMoney, contract.whenSigned)];
  }
}

class ThreeWayRecognitionsStrategy implements RecognitionsStrategy {
  private _firstRecognitionOffset: number;
  private _secondRecognitionOffset: number;

  constructor(firstRecognitionOffset: number, secondRecognitionOffset: number) {
    this._firstRecognitionOffset = firstRecognitionOffset;
    this._secondRecognitionOffset = secondRecognitionOffset;
  }
  calculateRecognitions(contract: Contract): RevenueRecognition[] {
    let rr: RevenueRecognition[] = [];
    const alloc_amount = contract.amountMoney.allocate(3);

    return [
      new RevenueRecognition(
        alloc_amount[0],
        this.offsetDate(contract.whenSigned, 0),
      ),
      new RevenueRecognition(
        alloc_amount[1],
        this.offsetDate(contract.whenSigned, this._firstRecognitionOffset),
      ),
      new RevenueRecognition(
        alloc_amount[2],
        this.offsetDate(contract.whenSigned, this._secondRecognitionOffset),
      ),
    ];
  }
  private offsetDate(baseDate: string, offsetDate: number): string {
    let rr_date_base = new Date(baseDate);
    rr_date_base.setDate(rr_date_base.getDate() + offsetDate);
    return rr_date_base.toISOString().split("T")[0];
  }
}

class RevenueRecognition {
  private _amount: Money;
  private _date: string;
  constructor(amount: Money, date: string) {
    assert(amount.currency() !== undefined, "Currency must be defined");
    this._amount = amount;
    this._date = date;
  }
  get amountMoney(): Money {
    return this._amount;
  }
  get amount(): number {
    return (
      Number(this._amount.amount().amount_internal) / this._amount.centFactor()
    );
  }
  get date(): string {
    return this._date;
  }
}

class Contract {
  private _ID: number;
  private _whenSigned: string;
  private _amount: Money;
  private _product: Product;
  private _revenueRecognitions: RevenueRecognition[] | undefined;
  constructor(
    ID: number,
    whenSigned: string,
    amount: Money,
    product: Product,
    revenueRecognitions: RevenueRecognition[] | undefined,
  ) {
    this._ID = ID;
    this._whenSigned = whenSigned;
    this._amount = amount;
    this._product = product;
    this._revenueRecognitions = revenueRecognitions;
  }
  public calculateRecognitions(): void {
    let rr = this.product.calculateRecognitions(this);
    this._revenueRecognitions = [...rr];
  }
  public get ID() {
    return this._ID;
  }
  get whenSigned(): string {
    return this._whenSigned;
  }
  get amountMoney(): Money {
    return this._amount;
  }
  get amount(): number {
    return (
      Number(this._amount.amount().amount_internal) / this._amount.centFactor() 
    );
  }
  get product(): Product {
    return this._product;
  }
  get revenueRecognitions(): RevenueRecognition[] | undefined {
    return this._revenueRecognitions;
  }
}

export class ContractRepository {
  private srv: RevenueCalculationServiceDM;
  constructor(srv: RevenueCalculationServiceDM) {
    this.srv = srv;
  }
  public async read(contractID: number): Promise<Contract> {
    const dataset = await SELECT.from(this.srv.entities.Contracts)
      .where({ ID: contractID })
      .columns((o: any) => {
        o.ID,
          o.whenSigned,
          o.amount,
          o.product((p: any) => {
            p.type;
          }),
          o.revenueRecognitions((r: any) => {
            r.items, r.amount, r.date, r.contract_ID;
          });
      });
    return new Contract(
      dataset[0].ID,
      dataset[0].whenSigned,
      Money.dollars(dataset[0].amount),
      Product.factoryProduct(dataset[0].product.type),
      dataset[0].revenueRecognitions.map(
        (r: any) =>
          new RevenueRecognition(new Money(r.amount, Currency.USD()), r.date),
      ),
    );
  }

  public async write(contract: Contract): Promise<void> {
    let rr = contract.revenueRecognitions?.map((r) => {
      return {
        items: cds.utils.uuid(),
        amount: r.amount,
        date: r.date,
        contract_ID: contract.ID,
      };
    });
    await this.srv.update(this.srv.entities.Contracts, contract.ID).set({
      ID: contract.ID,
      whenSigned: contract.whenSigned,
      amount: contract.amount,
      product: {
        ID: contract.product.ID,
        name: contract.product.name,
        type: contract.product.type,
      },
      revenueRecognitions: rr,
    });
  }
}

export class RevenueCalculationServiceDM extends cds.ApplicationService {
  init() {
    this.after("READ", this.entities.Contracts, (contracts: Contract[]) => {
       return contracts;
    });
    this.on(
      "calculateRecognitions",
      this.entities.Contracts,
      async (req: cds.Request) => {
        assert(req.params !== undefined);
        const [IdOfContract] = req.params;
        const repository = new ContractRepository(this);
        const aContract = await repository.read(Number(IdOfContract));
        aContract.calculateRecognitions();
        await repository.write(aContract);
      },
    );
    this.on("calculateRecognitions", async (req: cds.Request) => {
      assert(req.data !== undefined);
      const IdOfContract = req.data.contractID;
      const repository = new ContractRepository(this);
      const aContract = await repository.read(Number(IdOfContract));
      aContract.calculateRecognitions();
      await repository.write(aContract);
    });
    return super.init();
  }
}
