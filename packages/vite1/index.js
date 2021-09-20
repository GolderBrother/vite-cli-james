#!/usr/bin/env node
const yargs = require("yargs/yargs");
const createCommand = require("vite1/create/command");
const configCmd = require("vite1/config/command");
async function main() {
  const argv = process.argv.slice(2);
  const cli = yargs();
  cli
		.usage(`Usage: vite1 <command> [options]`)
		.demandCommand(1, '至少需要一个命令')
		.strict() // 不存在的命令会报错
		.recommendCommands() // 提示近似命令
    .command(createCommand) // 创建命令
    .command(configCmd) // 配置命令
		.parse(argv)
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error(error);
  }
})();



