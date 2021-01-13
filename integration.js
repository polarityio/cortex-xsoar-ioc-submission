'use strict';

const validateOptions = require('./src/validateOptions');
const createRequestWithDefaults = require('./src/createRequestWithDefaults');
const searchTags = require('./src/searchTags');
const deleteItem = require('./src/deleteItem');
const searchIndicatorTypes = require('./src/searchIndicatorTypes');
const searchIncidentTypes = require('./src/searchIncidentTypes');
const createIndicators = require('./src/createIndicators');

const { handleError } = require('./src/handleError');
const { getLookupResults } = require('./src/getLookupResults');

let Logger;
let requestWithDefaults;
const startup = (logger) => {
  Logger = logger;
  requestWithDefaults = createRequestWithDefaults(Logger);
};


const doLookup = async (entities, { url, ..._options }, cb) => {
  Logger.debug({ entities }, 'Entities');
  const options = {
    ..._options,
    url: url.endsWith('/') ? url.slice(0, -1) : url
  };

  let lookupResults;
  try {
    lookupResults = await getLookupResults(
      entities,
      options,
      requestWithDefaults,
      Logger
    );
  } catch (error) {
    Logger.error(error, 'Get Lookup Results Failed');
    return cb(handleError(error));
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};

const getOnMessage = {
  DELETE_ITEM: deleteItem,
  SUBMIT_ITEMS: createIndicators,
  SEARCH_TAGS: searchTags,
  SEARCH_INDICATOR_TYPES: searchIndicatorTypes,
  SEARCH_INCIDENT_TYPES: searchIncidentTypes
};

const onMessage = ({ data: { action, ...actionParams} }, options, callback) => 
  getOnMessage[action](actionParams, requestWithDefaults, options, Logger, callback);


module.exports = {
  doLookup,
  startup,
  validateOptions,
  onMessage
};
