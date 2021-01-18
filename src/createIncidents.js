const fp = require('lodash/fp');
const { ENTITY_DISPLAY_TYPES } = require('./constants');
const getPlaybooksByEntityGroup = require('./getPlaybooksByEntityGroup');

const createIndicators = async (
  {
    newIncidentIocsToSubmit,
    foundIncidentEntities,
    newIncidentIocs,
    submissionDetails,
    selectedIncidentType,
    severity,
    newIncidentPlaybookId
  },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    const createdItems = await createItems(
      newIncidentIocsToSubmit,
      submissionDetails,
      selectedIncidentType,
      severity,
      newIncidentPlaybookId,
      options,
      requestWithDefaults,
      Logger
    );

    const playbooks = await getPlaybooksByEntityGroup(
      newIncidentIocs,
      options,
      requestWithDefaults,
      Logger
    );

    return callback(null, {
      foundIncidentEntities: [...createdItems, ...foundIncidentEntities],
      playbooks
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
  newIncidentIocsToSubmit,
  submissionDetails,
  selectedIncidentType,
  severity,
  newIncidentPlaybookId,
  options,
  requestWithDefaults,
  Logger
) => {
  const newlyCreatedIncidents = await Promise.all(
    fp.map(async (entity) => {
      const newlyCreatedIncident = fp.get(
        'body',
        await _createIncidentAndRunPlaybook(
          entity.value,
          newIncidentPlaybookId,
          submissionDetails,
          severity,
          selectedIncidentType,
          options,
          requestWithDefaults
        )
      );

      await _startInvestigation(newlyCreatedIncident, options, requestWithDefaults);

      return { ...entity, ...newlyCreatedIncident, displayedType: _getDisplayType(entity) };
    }, newIncidentIocsToSubmit)
  );

  return newlyCreatedIncidents;
};

const _createIncidentAndRunPlaybook = (
  entityValue,
  playbookId,
  submissionDetails,
  severity,
  selectedType,
  options,
  requestWithDefaults
) =>
  requestWithDefaults({
    url: `${options.url}/incident`,
    method: 'POST',
    headers: {
      authorization: options.apiKey,
      'Content-type': 'application/json'
    },
    body: {
      name: entityValue,
      ...(playbookId && { playbookId }),
      ...(selectedType && { type: selectedType.id }),
      severity: fp.toNumber(severity),
      labels: [
        {
          type: 'Origin',
          value: 'Polarity'
        }
      ],
      ...(submissionDetails && { details: submissionDetails })
    }
  });

const _startInvestigation = (newIncident, options, requestWithDefaults) =>
  requestWithDefaults({
    url: `${options.url}/incident/investigate`,
    method: 'POST',
    headers: {
      authorization: options.apiKey,
      'Content-type': 'application/json'
    },
    body: {
      id: newIncident.id,
      version: 1
    }
  });

const _getDisplayType = (entity) =>
  fp.get(
    fp.get('isHash', entity) ? fp.get('hashType', entity) : fp.get('type', entity),
    ENTITY_DISPLAY_TYPES
  );


module.exports = createIndicators;
