using {db} from '../db/schema';

service Contracts {
    entity RecordSet {
        key ID: Integer;
        whenSigned : Date;
        Amount : Decimal;
        ProductName : String;
        RevenueRecognitions : many { ID: Integer; amount: Decimal; date: Date; };
    } actions {
        function requestData(ID: Integer) returns RecordSet;
    }
}

service TableGateway {
    entity Contracts as projection on db.Contracts;
    entity Products as projection on db.Products;
    entity RevenueRecognitions as projection on db.RevenueRecognitions; 
}