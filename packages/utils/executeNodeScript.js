const spawn = require('cross-spawn');
async function executeNodeScript({ cwd }, source, args) {
    return new Promise((resolve, reject) => {
        const childProcess = spawn(
            process.execPath,
            ["-e", source, "--", JSON.stringify(args)],
            { cwd, stdio: 'inherit' }
        );
        childProcess.on()
    });
}
module.exports = executeNodeScript;