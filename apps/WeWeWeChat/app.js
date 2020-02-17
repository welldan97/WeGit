// Imports
// =============================================================================

const { readFileSync } = require('fs');

console.log(__dirname);
// NOTE: The path is long because the __dirname is
//   WeGit/browser-client/node_modules/wegit-lib/WgOs
const weWeWeChatSource = readFileSync(
  __dirname + '../../../../../apps/WeWeWeChat/index.jsx',
  'utf-8',
);

// Main
// =============================================================================

const { groups: rawApp } = new RegExp(`// ==WgApp==
// @name (?<name>.*)
// @description (?<description>.*)
// @icon (?<rawIcon>.*)
// @user (?<rawUser>.*)
`).exec(weWeWeChatSource);

module.exports = {
  id: 'WE-WE-WE-WE-WE-WECHAT',
  name: rawApp.name,
  description: rawApp.description,
  // TODO: dangerous, eval!
  icon: eval(rawApp.rawIcon),
  user: JSON.parse(rawApp.rawUser),
  source: weWeWeChatSource,
};
