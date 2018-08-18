//Constants for env variables and configs

export const config = {
    loggerLevel : process.env.LOGGER_LEVEL || 'debug',
    port: process.env.PORT || '3000',
    searchUrl : process.env.SEARCH_URL || '',
    metaDataUrl : process.env.META_URL || ''
};
