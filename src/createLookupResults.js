const fp = require('lodash/fp');
const { ENTITY_DISPLAY_TYPES } = require('./constants');
const getPlaybooksByEntityGroup = require('./getPlaybooksByEntityGroup');

let maxUniqueKeyNumber = 0;

const createLookupResults = async (
  entities,
  _foundIncidentEntities,
  _foundIndicatorEntities,
  requestWithDefaults,
  options,
  Logger
) => {
  const foundIndicatorEntities = getFoundEntities(_foundIndicatorEntities, entities, 'value');
  const notFoundIndicatorEntities = getNotFoundEntities(foundIndicatorEntities, entities);

  const foundIncidentEntities = getFoundEntities(_foundIncidentEntities, entities, 'name');
  const notFoundIncidentEntities = getNotFoundEntities(foundIncidentEntities, entities);


  const entityGroupsWithPlaybooks = await getPlaybooksByEntityGroup(
    notFoundIncidentEntities,
    options,
    requestWithDefaults,
    Logger
  );

  const summary = [
    ...(foundIndicatorEntities.length ? ['Indicators Found'] : []),
    ...(foundIncidentEntities.length ? ['Incidents Found'] : []),
    ...(notFoundIndicatorEntities.length || notFoundIncidentEntities.length
      ? ['New Entities']
      : [])
  ];
  maxUniqueKeyNumber++;

  return [
    {
      entity: {
        ...entities[0],
        value: 'Cortex XSOAR IOC Submission'
      },
      isVolatile: true,
      data: {
        summary,
        details: {
          url: `${options.url}/#`,
          maxUniqueKeyNumber,
          [`summary${maxUniqueKeyNumber}`]: summary,
          [`foundIndicatorEntities${maxUniqueKeyNumber}`]: foundIndicatorEntities,
          [`notFoundIndicatorEntities${maxUniqueKeyNumber}`]: notFoundIndicatorEntities,
          [`foundIncidentEntities${maxUniqueKeyNumber}`]: foundIncidentEntities,
          [`notFoundIncidentEntities${maxUniqueKeyNumber}`]: notFoundIncidentEntities,
          [`playbooks${maxUniqueKeyNumber}`]: entityGroupsWithPlaybooks
        }
      }
    }
  ];
};

const getFoundEntities = (_foundEntities, entities, comparisonKey) =>
  fp.flow(
    fp.filter((foundEntity) =>
      fp.any(({ value }) => fp.toLower(value) === fp.toLower(foundEntity[comparisonKey]), entities)
    ),
    fp.map((foundEntity) => {
      const lookupEntity = fp.find(
        ({ value }) => fp.toLower(value) === fp.toLower(foundEntity[comparisonKey]),
        entities
      );

      return {
        ...lookupEntity,
        ...foundEntity,
        displayedType: getDisplayType(lookupEntity)
      };
    })
  )(_foundEntities);

const getNotFoundEntities = (foundEntities, entities) =>
  fp.reduce(
    (agg, entity) =>
      !fp.any(
        ({ value }) => fp.lowerCase(entity.value) === fp.lowerCase(value),
        foundEntities
      )
        ? agg.concat({
            ...entity,
            displayedType: getDisplayType(entity)
          })
        : agg,
    [],
    entities
  );

const getDisplayType = (entity) =>
  fp.get(
    fp.get('isHash', entity)
      ? fp.get('hashType', entity)
      : fp.get('type', entity),
    ENTITY_DISPLAY_TYPES
  );

module.exports = createLookupResults;
