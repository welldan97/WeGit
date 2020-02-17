// Imports
// =============================================================================

const { readFileSync } = require('fs');
const nanoid = require('nanoid');

// NOTE: The path is long because the __dirname is
//   WeGit/browser-client/node_modules/wegit-lib/WgOs
const weWeWeChatSource = readFileSync(
  __dirname + '../../../../../apps/WeWeWeChat/index.jsx',
  'utf-8',
);

// Utils
// =============================================================================

const parseAppSource = (appSource, options) => {
  const { groups: rawApp } = new RegExp(
    `// ==WgApp==
// @name (?<name>.*)
// @description (?<description>.*)
// @icon (?<rawIcon>.*)
// @user (?<rawUser>.*)`,
  ).exec(appSource);

  return {
    id: nanoid(),
    name: rawApp.name,
    description: rawApp.description,
    // TODO: dangerous, eval!
    icon: eval(rawApp.rawIcon),
    user: JSON.parse(rawApp.rawUser),
    source: appSource,
    ...options,
  };
};

// Main
// =============================================================================

module.exports = parseAppSource(weWeWeChatSource, {
  id: 'WE-WE-WE-WE-WE-WECHAT',
});
