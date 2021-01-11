const fp = require('lodash/fp');

const searchTags = async (
  { term, selectedTags },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    const tagResults = fp.getOr(
      [],
      'body.data', // TODO: Modify to correct path
      // await requestWithDefaults({
      //   // TODO: Add properties to tag searching here
      //   options
      // })
      undefined
    );

    const tags = formatTags(tagResults, selectedTags);

    callback(null, { tags });
  } catch (error) {
    Logger.error(error, { detail: 'Failed to Get Tags from ___' }, 'Get Tags Failed');
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

const _getComparableString = fp.flow(fp.getOr('', 'name'), fp.lowerCase, fp.trim);

const formatTags = (tagResults, selectedTags) =>
  // TODO: Modify data as needed to ensure the tag objects include a `name` property
  fp.flow(
    fp.filter((tagResult) =>
      fp.every(
        (selectedTag) =>
          _getComparableString(tagResult) !== _getComparableString(selectedTag),
        selectedTags
      )
    ),
    fp.uniqBy(_getComparableString),
    fp.sortBy('name'),
    fp.slice(0, 50)
  )(tagResults);

module.exports = searchTags;
