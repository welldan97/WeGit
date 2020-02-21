// Imports
// =============================================================================

const nanoid = require('nanoid');

// Main
// =============================================================================

module.exports = (appSource, options) => {
  const { groups: rawApp } = new RegExp(
    `// ==WgApp==
// @id (?<id>.*)
// @name (?<name>.*)
// @description (?<description>.*)
// @icon (?<rawIcon>.*)
// @user (?<rawUser>.*)`,
  ).exec(appSource);
  return {
    id: rawApp.id || nanoid(),
    name: rawApp.name,
    description: rawApp.description,
    // TODO: dangerous, eval!
    icon: eval(rawApp.rawIcon),
    user: JSON.parse(rawApp.rawUser),
    source: appSource,
    ...options,
  };
};
