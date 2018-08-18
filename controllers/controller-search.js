import { getSearchResults } from '../models/model-search';
import  logger from '../logger';

//Controller function for "/" route defined in app.js
export async function searchController(req, res) {
    try {
        //make sure we have a search value to send out to the model
        if (!req.params.slug) {
            res.status(400).send({ error: 'No search value' });
            logger.debug ('controller-search.js | no serch value');

        } else {
            let results = await getSearchResults(req.params.slug);
            res.status(200).send( results );
        }
    }
    catch (error) {
        //log the issue.
        logger.error(`controller-search.js | catch from search model : ${error}`);

        //respond with the error
        res.status(400).send({ error });

    }

}