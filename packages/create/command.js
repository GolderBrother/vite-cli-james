// const { COMMAND_SOURCE } = require('@vite1/settings');
// const { executeNodeScript } = require('@vite1/utils');
const command = {
    command: 'create <name>',
    describe: '创建项目',
    builder: (yargs) => {
        yargs.positional('name', {
            type: 'string',
            describe: '项目名称'
        })
    },
    handler: async function (argv) {
        const args = {
            projectName: argv.name,
            workingDirectory: process.cwd()
        };
        // await executeNodeScript({
        //     cwd: __dirname
        // }, COMMAND_SOURCE, args);
        require('.')(args);
    }
};
module.exports = command;