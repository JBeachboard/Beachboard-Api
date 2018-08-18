import { config } from './config';
import winston from 'winston';

//timestamp for logger
const tsFormat = () => (new Date()).toLocaleTimeString();
const logger = winston.createLogger({
    level : config.loggerLevel,

    transports: [
        new winston.transports.Console({ format: winston.format.simple()})
    ]
});
// logger level is set in the config

module.exports = logger;