const communicationConstants = require("./communication-constants");
const normalizationHelpers = require("./normalize-communication-input");
const classificationHelpers = require("./classify-communication");

module.exports = {
  ...communicationConstants,
  ...normalizationHelpers,
  ...classificationHelpers,
};
