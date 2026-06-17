const communicationConstants = require("./communication-constants");
const normalizationHelpers = require("./normalize-communication-input");
const classificationHelpers = require("./classify-communication");
const reviewSummaryHelpers = require("./prepare-communication-review-summary");

module.exports = {
  ...communicationConstants,
  ...normalizationHelpers,
  ...classificationHelpers,
  ...reviewSummaryHelpers,
};
