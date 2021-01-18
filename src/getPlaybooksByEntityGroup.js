const { PLAYBOOK_SEARCH_TERMS } = require('./constants');
const fp = require('lodash/fp');
const { _P } = require('./dataTransformations');

const getPlaybooksByEntityGroup = (
  entitiesPartition,
  options,
  requestWithDefaults,
  Logger
) =>
  _P
    .chain(entitiesPartition)
    .groupBy(_getEntityType)
    .reduce(_getPlaybooksForEntityType(options, Logger, requestWithDefaults), [])
    .value();

const _getEntityType = ({ isIP, isHash, isDomain, isEmail }) =>
  isIP ? 'ip' : isHash ? 'hash' : isDomain ? 'domain' : isEmail && 'email';

const _getPlaybooksForEntityType = (options, Logger, requestWithDefaults) => async (
  agg,
  valueEntities,
  keyEntityType
) => {
  const {
    body: { playbooks }
  } = await requestWithDefaults({
    url: `${options.url}/playbook/search`,
    method: 'POST',
    headers: {
      authorization: options.apiKey,
      'Content-type': 'application/json'
    },
    body: {
      query: PLAYBOOK_SEARCH_TERMS[keyEntityType]
    }
  })
    .catch((error) => {
      Logger.error({ error }, 'Incident Query Error');
      throw error;
    });

  const unorganizedPlaybooks = [
    ...agg,
    ...fp.flow(
      fp.filter((playbook) => !playbook.hidden),
      fp.map((playbook) => ({
        ...playbook,
        keyEntityType,
        name: `(${keyEntityType}) ${playbook.name}`
      }))
    )(playbooks)
  ];

  return fp.flow(
    fp.groupBy('keyEntityType'),
    fp.mapValues(fp.sortBy('name')),
    (playbooksByType) => {
      const get = (key) => fp.get(key, playbooksByType);
      return fp.flow(
        fp.concat(get('hash')),
        fp.concat(get('email')),
        fp.concat(get('domain')),
        fp.concat(get('ip')),
        fp.compact
      )([]);
    }
  )(unorganizedPlaybooks);
};

module.exports = getPlaybooksByEntityGroup;