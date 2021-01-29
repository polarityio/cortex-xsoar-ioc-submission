const fp = require('lodash/fp');
const getPlaybooksByEntityGroup = require('./getPlaybooksByEntityGroup');

const deleteIncident = async (
  { entity, newIncidentIocs, foundIncidentEntities },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    await requestWithDefaults({
      url: `${options.url}/incident/batchDelete`,
      method: 'POST',
      headers: {
        authorization: options.apiKey,
        'Content-type': 'application/json'
      },
      body: {
        ids: [entity.id],
        reason: 'Deleted by Polarity IOC Submission Integration',
        all: false,
        filter: {},
      }
    });
    const _newIncidentIocs = [entity, ...newIncidentIocs]

    const playbooks = await getPlaybooksByEntityGroup(
      _newIncidentIocs,
      options,
      requestWithDefaults,
      Logger
    );

    return callback(null, {
      newList: fp.filter(({ value }) => value !== entity.value, foundIncidentEntities),
      newIncidentIocs: _newIncidentIocs,
      playbooks
    });
  } catch (error) {
    Logger.error(error, 'Incident Deletion Error');
    return callback({
      errors: [
        {
          err: error,
          detail: error.message
        }
      ]
    });
  }
};

module.exports = deleteIncident;