const STATUS_CODE_ERROR_MESSAGE = {
  400: (error) => ({
    err: 'Unauthorized',
    detail: 'Unable to retrieve Auth Token -> ' + `${error.description}`
  }),
  403: (error) => ({
    err: 'Token Expired',
    detail:
      'The Token has Expired or is Incorrect.  Verify your token is correct and retry your request to reauthorize.'
  }),
  404: (error) => ({
    err: 'Not Found',
    detail:
      'Requested item doesn’t exist or not enough access permissions -> ' +
      `${error.description}`
  }),
  405: (error) => ({
    err: 'Incident Query Error',
    detail: 'Possible malformed request -> ' + `${error.description}`
  }),
  500: (error) => ({
    err: 'Server Error',
    detail: 'Unexpected Server Error -> ' + `${error.description}`
  }),
  internalServiceError: (error) => ({
    err: 'Internal Service Error',
    detail: 'Internal Service Error -> ' + `${error.description}`
  }),
  unknown: (error) =>
    error.message.includes('getaddrinfo ENOTFOUND')
      ? {
          err: 'Url Not Found',
          detail: `The Url you used in options was Not Found -> ${error.message}`
        }
      : error.message.includes('self signed certificate')
      ? {
          err: 'Problem with Certificate',
          detail: `A Problem was found with your Certificate -> ${error.message}`
        }
      : {
          err: 'Unknown',
          detail: error.message
        }
};

const handleError = (error) =>
  (
    STATUS_CODE_ERROR_MESSAGE[error.status] ||
    STATUS_CODE_ERROR_MESSAGE[Math.round(error.status / 10) * 10] ||
    STATUS_CODE_ERROR_MESSAGE['unknown']
  )(error);

const checkForInternalServiceError = (statusCode, response) => {
  const { error, detail } = response || {};
  if (error) {
    const internalDemistoError = Error('Internal Demisto Query Error');
    internalDemistoError.status = 'internalServiceError';
    internalDemistoError.description = `${error} -> ${detail}`;
    throw internalDemistoError;
  }
  return response;
};

module.exports = { handleError, checkForInternalServiceError };
