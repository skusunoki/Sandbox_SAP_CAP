namespace db;

entity Products {
  key ID : Integer;
  name : String;
  type : String;
}

entity Contracts {
  key ID : Integer;
  whenSigned : Date;
  Amount : Decimal;
  product : Association to Products;
}

entity RevenueRecognitions {
  key ID : Integer;
  amount : Decimal;
  date : Date;
  contract : Association to Contracts;
}
