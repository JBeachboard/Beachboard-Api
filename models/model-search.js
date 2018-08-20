import { config } from './../config';
import Request from 'superagent';
import Promise from 'bluebird';
import sortKeys from 'sort-keys';
import  logger from '../logger';


// Model function used by the search controller when requested by the "/" route.
// Start of the function chain : 
// Takes in a search value, and returns back a compiled object array. 
export async function getSearchResults(searchValue) {
    try {
        //send out the value to the base search after escaping it. 
        let searchReturn = await querySearch(escape(searchValue));

        //check if we have items in the return, if so send the object.items to get
        //its meta data
        if ('items' in searchReturn) {
            if (searchReturn.items.length) {
                let searchReturnWithMeta = await queryAndAddMeta(searchReturn.items);
                return (searchReturnWithMeta);

            } else {
                //if there is no results returned.
                logger.debug(`model-search.js | getSearchResults | no results from querySearch `);

                //assuming this is the correct response to no results found.
                return ([]);
            }
        } else {
            //log the issue and error
            logger.error(`model-search.js | getSearchResults | catch from getSearchResults : Error in data contract`);
            
            throw ('Error in data contract');
        }

    }

    catch (error) {
        //log the issue and error
        logger.error(`model-search.js | catch from getSearchResults : ${error}`);

        throw (`${error}`);
    }

}

//Make the base call the search API

// NOTE : If the query API and the meta API were more similar I would
// combine the call but I felt that it was better to seperate the function
// for ease of use.
async function querySearch(searchValue) {
    logger.debug(`Making post request to : ${config.searchUrl} : with ${searchValue} as value`);

    let results = await Request
        .post(config.searchUrl)
        .send({ term: searchValue });
    return results.body;
}

//loops over the passed object and adds the meta data from a the meta data api
// Returns the complete modified object array.
async function queryAndAddMeta(resultsArray) {
    try {
        //define the return object
        let returnArray = [];
        
        //using a promise map with the added bonus of concurrency.
        await Promise.map(resultsArray, async searchItem => {
            //go get the meta results
            let metaResult = await queryMeta(searchItem.id);

            //go pluck the requested parameter
            let param = await fetchMetaParam(metaResult, 'originalFilename');

            //normally I would add the key to the object when I get the parameter but
            //then I couldn't use object spread! 

            //Also using sortKeys to realphabatize the object 
            let combinedObj = sortKeys({ ...searchItem, ...param });

            returnArray.push(combinedObj);
    
        }, { concurrency: 20 });

        return returnArray;
    }
    catch (error) {
        //log the issue and error
        logger.error(`model-search.js | catch from queryAndAddMeta : ${error}`);

        throw (`${error}`);
    }
}

//Call to the meta api with the target id
async function queryMeta(id) {
    logger.debug(`Making call to ${config.metaDataUrl} with id of ${id}`);

    let url = `${config.metaDataUrl}${id}`;
    let results = await Request
        .get(url);
    return results.body;
}

//Takes the resuts of a the meta query and pulls out a requested param.
//Returns a objects with the param is the key.
async function fetchMetaParam(itemArray, param) {
    try {
        //find the key
        let foundObject = itemArray.find( (obj) => obj.name == param );

        return ({ [param]: foundObject.value[0].value });
    }
    catch (error) {
        //I dont feel like a messup here should effect the end result so pass back a dummy object
        logger.debug(`model-search.js | catch from fetchMetaParam : ${error}`);

        return ({ [param]: null });
    }
}
