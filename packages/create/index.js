const path = require('path');
const { config, log } = require('@vite1/utils');
const { red } = require('chalk');
const execa = require('execa');
const getPromptModules = require('./lib/getPromptModules');
const Creator = require('./lib/Creator');

async function create(argv) {
    const { workingDirectory, projectName } = argv;
    const { GIT_TYPE, ORG_NAME } = config;
    if (!GIT_TYPE) throw new Error(red('X') + ' 尚未配置仓库类型!');
    if (!ORG_NAME) throw new Error(red('X') + ' 尚未配置组织名称!');
    const projectDir = path.join(workingDirectory, projectName);
    log.info('vite1' + '当前创建的项目目录为: %s', projectDir);
    const promptModules = getPromptModules();
    console.info("选择项promptModules", promptModules);
    const creator = new Creator(projectName, projectDir, promptModules);
    await creator.create();
    log.info('vite1', '启动服务...');
    await execa('npm', ['run', 'dev'], {
        cwd: projectDir,
        stdio: 'inherit'
    });
}

module.exports = (...args) => {
    return create(...args).catch(err => console.error(err));
};