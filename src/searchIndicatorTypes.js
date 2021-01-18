const fp = require('lodash/fp');

const searchIndicatorTypes = async (
  { term, selectedIndicatorType },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    const types = fp.flow(
      fp.getOr([], 'body'),
      searchByTerm(term, selectedIndicatorType),
      fp.filter(fp.negate(fp.get('disabled'))),
      fp.sortBy('details'),
      fp.slice(0, 50)
    )(
      await requestWithDefaults({
        url: `${options.url}/reputation`,
        method: 'GET',
        headers: { authorization: options.apiKey }
      })
    );

    callback(null, { types });
  } catch (error) {
    Logger.error(
      error,
      { detail: 'Failed to Get Indicator Types from Cortex XSOAR' },
      'Get Types Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: 'Cortex XSOAR Indicator Type Search Error - ' + error.message
        }
      ]
    });
  }
};

const searchByTerm = (term, selectedType) =>
  fp.filter(
    (indicatorType) =>
      fp.flow(
        fp.getOr('', 'details'),
        fp.toLower,
        fp.includes(fp.toLower(term))
      )(indicatorType) &&
      ((selectedType && selectedType.id !== indicatorType.id) || !selectedType)
  );
  
module.exports = searchIndicatorTypes;
