const fp = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const queryIncidents = require('./queryIncidents');
const queryIndicators = require('./queryIndicators');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {
  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);

  const foundIncidentEntities = await queryIncidents(
    entitiesPartition,
    options,
    requestWithDefaults,
    Logger
  );

  const foundIndicatorEntities = await queryIndicators(
    entitiesPartition,
    options,
    requestWithDefaults,
    Logger
  );

  const lookupResults = await createLookupResults(
    entitiesPartition,
    foundIncidentEntities,
    foundIndicatorEntities,
    requestWithDefaults,
    options,
    Logger
  );

  Logger.trace(
    { lookupResults, foundIndicatorEntities },
    'Lookup Results'
  );

  return lookupResults.concat(ignoredIpLookupResults);
};



module.exports = {
  getLookupResults
};
