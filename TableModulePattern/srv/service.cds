using {db} from '../db/schema';

service RevenueCalculationService {
    entity Contracts as projection on db.Contracts 
    actions {
            action calculateRecognitions() ;
    }
}
