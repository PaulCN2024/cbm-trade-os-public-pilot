const aiDraftReviewDisplayAdapter = require("./ai-draft-review-display-adapter");
const registryMetadataDisplayAdapter = require("./registry-metadata-display-adapter");

module.exports = {
  ...aiDraftReviewDisplayAdapter,
  ...registryMetadataDisplayAdapter,
};
