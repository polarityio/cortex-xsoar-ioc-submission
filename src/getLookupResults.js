const fp = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const getPlaybooksByEntityGroup = require('./getPlaybooksByEntityGroup');
const queryIncidents = require('./queryIncidents');
const queryIndicators = require('./queryIndicators');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {
  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(entities);

  const entityGroupsWithPlaybooks = await getPlaybooksByEntityGroup(
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

  const lookupResults = createLookupResults(
    entitiesPartition,
    foundIndicatorEntities,
    entityGroupsWithPlaybooks,
    options,
    Logger
  );

  Logger.trace(
    { lookupResults, foundIndicatorEntities, entityGroupsWithPlaybooks },
    'Lookup Results'
  );

  return lookupResults.concat(ignoredIpLookupResults);
};



module.exports = {
  getLookupResults
};
