const fp = require('lodash/fp');

const deleteItem = async (
  { entity, newIocs, foundEntities },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    await requestWithDefaults({
      url: `${options.url}/indicators/batchDelete`,
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
        doNotWhitelist: true,
        reputations: null
      }
    });
  } catch (error) {
    Logger.error(error, 'Indicator Deletion Error');
    return callback({
      errors: [
        {
          err: error,
          detail: error.message
        }
      ]
    });
  }

  return callback(null, {
    newList: fp.filter(({ value }) => value !== entity.value, foundEntities),
    newIocs: [entity, ...newIocs]
  });
};

module.exports = deleteItem;