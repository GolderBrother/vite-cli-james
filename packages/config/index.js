const fs = require("fs-extra");
const { log, config } = require("@vite1/utils");
async function factory(argv) {
  const { key, value } = argv;
  if (key && value) {
    config[key] = value;
    await fs.writeJSON(config.configPath, config, {
      spaces: 2,
    });
    log.info("vite1", "(%s=%s)配置成功保存至%s", key, value, config.configPath);
  } else if (key) {
    console.log("%s=%s", key, config[key]);
  } else {
    console.log(config);
  }
}
module.exports = factory;
