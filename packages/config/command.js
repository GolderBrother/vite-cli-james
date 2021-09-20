const { executeNodeScript } = require('@vite1/utils');
const { COMMAND_SOURCE } = require('@vite1/settings');
const command = {
    command: `config [key] [value]`,
    describe: "设置或查看配置项,比如GIT_TYPE设置仓库类型，ORG_NAME设置组织名",
    builder: (yargs) => {},
    handler:async function(argv){
        //await executeNodeScript({ cwd: __dirname }, COMMAND_SOURCE,argv);
        require('.')(argv);
    },
};
module.exports = command;