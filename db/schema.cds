namespace db;

entity Products {
  key ID : Integer;
  name : String;
  type : String;
}

entity Contracts {
  key ID : Integer;
  whenSigned : Date;
  amount : Decimal;
  product : Association to Products;
  revenueRecognitions : Composition of many RevenueRecognitions on revenueRecognitions.contract = $self;
}

entity RevenueRecognitions {
    key items : UUID;
    amount : Decimal;
    date : Date;
    contract : Association to Contracts;
  }

