using {db} from '../db/schema';

service RevenueCalculationService {
    entity Contracts as projection on db.Contracts 
    actions {
            action calculateRecognitions(contractID: UUID) ;
    }
    entity RevenueRecognitions as projection on db.RevenueRecognitions

}
