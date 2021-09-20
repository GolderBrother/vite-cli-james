const userhome = require('userhome');
const fs = require('fs-extra');
const { RC_NAME } = require('@vite1/settings');
const configPath = userhome(RC_NAME);
let config = {};
if (fs.existsSync(configPath)) config = fs.readJSONSync(configPath);
config.configPath = configPath;
module.exports = config;
