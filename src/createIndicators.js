const fp = require('lodash/fp');
const { ENTITY_DISPLAY_TYPES, INDICATOR_TYPE_DEFAULTS } = require('./constants');

const createIndicators = async (
  {
    newIndicatorIocsToSubmit,
    foundIndicatorEntities,
    indicatorComment,
    reputation,
    selectedIndicatorType
  },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    const createdItems = await createItems(
      newIndicatorIocsToSubmit,
      indicatorComment,
      reputation,
      selectedIndicatorType,
      options,
      requestWithDefaults,
      Logger
    );

    return callback(null, {
      foundIndicatorEntities: [...createdItems, ...foundIndicatorEntities]
    });
  } catch (error) {
    Logger.error(
      error,
      { detail: 'Failed to Create Indicators in Cortex XSOAR' },
      'IOC Creation Failed'
    );
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

const createItems = async (
  newIndicatorIocsToSubmit,
  indicatorComment,
  reputation,
  selectedIndicatorType,
  options,
  requestWithDefaults,
  Logger
) => {
  const newlyCreatedIndicators = fp.map(
    fp.get('body'),
    await Promise.all(
      fp.map(
        (entity) =>
          _createIndicatorRequest(
            entity,
            indicatorComment,
            reputation,
            selectedIndicatorType,
            options,
            requestWithDefaults
          ),
        newIndicatorIocsToSubmit
      )
    )
  );
  
  return fp.map((createdEntity) => ({
    ...createdEntity,
    displayedType: fp.flow(
      fp.find(({ value }) => fp.toLower(value) === fp.toLower(createdEntity.value)),
      _getDisplayType
    )(newIndicatorIocsToSubmit)
  }))(newlyCreatedIndicators);
};

const _createIndicatorRequest = (
  entity,
  indicatorComment,
  reputation,
  selectedIndicatorType,
  options,
  requestWithDefaults
) =>
  requestWithDefaults({
    url: `${options.url}/indicator/create`,
    method: 'POST',
    headers: {
      authorization: options.apiKey,
      'Content-type': 'application/json'
    },
    body: {
      indicator: {
        value: entity.value,
        indicator_type:
          fp.get('details', selectedIndicatorType) ||
          INDICATOR_TYPE_DEFAULTS[_getEntityType(entity)],
        manualScore: true,
        score: fp.toNumber(reputation),
        ...(indicatorComment && { comments: [{ content: indicatorComment }] })
      },
      seenNow: true
    }
  });

const _getDisplayType = (entity) =>
  fp.get(
    fp.get('isHash', entity) ? fp.get('hashType', entity) : fp.get('type', entity),
    ENTITY_DISPLAY_TYPES
  );

const _getEntityType = ({ isIP, isHash, isDomain, isEmail }) =>
  isIP ? 'ip' : 
  isDomain ? 'domain' : 
  isEmail ? 'email' : 
  isHash && (
    hashType === 'MD5' ? 'md5' : 
    hashType === 'SHA1' ? 'sha1' : 
    hashType === 'SHA256' ? 'sha256' : 
    'otherHash'
  ); 

module.exports = createIndicators;
