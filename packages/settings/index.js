// 执行命令脚本
exports.COMMAND_SOURCE = `
const args = JSON.parse(process.argv[1]);
const factory = require('.');
factory(args);
`;

// 配置文件名称
exports.RC_NAME = ".vite1rc";

// 模板存放名称
exports.TEMPLATES = ".vite1_templates";