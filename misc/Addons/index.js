const json = require("./config.json");
const addon = require("./addons-src/build/Release/addon.node");

debugger;
console.log("JSON file", json.some);
console.log("C++ Addon", addon.hello());
