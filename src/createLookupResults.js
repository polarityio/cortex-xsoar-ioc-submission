const fp = require('lodash/fp');
const { ENTITY_DISPLAY_TYPES } = require('./constants');

let maxUniqueKeyNumber = 0;

const createLookupResults = (
  entities,
  _foundIndicatorEntities,
  entityGroupsWithPlaybooks,
  options,
  Logger
) => {
  const foundIndicatorEntities = getFoundEntities(_foundIndicatorEntities, entities);

  const notFoundIndicatorEntities = getNotFoundEntities(foundIndicatorEntities, entities);

  const summary = [
    ...(foundIndicatorEntities.length ? ['Indicators Found'] : []),
    ...(notFoundIndicatorEntities.length ? ['New Entities'] : [])
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
          [`foundEntities${maxUniqueKeyNumber}`]: foundIndicatorEntities,
          [`notFoundEntities${maxUniqueKeyNumber}`]: notFoundIndicatorEntities
        }
      }
    }
  ];
};

const getFoundEntities = (_foundEntities, entities) =>
  fp.flow(
    fp.filter(({ value }) =>
      fp.any(({ value: _value }) => fp.toLower(value) === fp.toLower(_value), entities)
    ),
    fp.map((foundEntity) => ({
      ...foundEntity,
      displayedType: fp.flow(
        fp.find(({ value }) => fp.toLower(value) === fp.toLower(foundEntity.value)),
        getDisplayType
      )(entities)
    }))
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
