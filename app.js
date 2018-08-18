import express from 'express';
import { config } from './config';
import  logger from './logger';

const app = express();

//middleware to let express handle awaits
const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
  };

// NOTE : Normally imports go on the top but I've found that
// with apis and multiple routes putting the import grouped with the
// routes it uses makes for a easier to read route list

//because you always need a healthcheck.
import { healthcheck } from './controllers/controller-healthcheck.js';
app.get('/healthcheck', healthcheck );

//requested endpoint of '/' it will handle both with and without values
import { searchController } from './controllers/controller-search.js';
app.get('/:slug?', asyncMiddleware(async (req, res) => {
    const searchResult = await searchController(req, res);
    res.send(searchResult)
}));

//define the listener
app.listen(config.port, () => console.log(`Starting up and all ears on port ${config.port}`))

logger.debug(`Application started : ${(new Date()).toLocaleTimeString()}`);
