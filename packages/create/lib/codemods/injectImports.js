function injectImports(fileInfo, api, { imports }) {
    const jsCodeShift = api.jscodeshift;
    const root = jsCodeShift(fileInfo.source);
    const declarations = root.find(jsCodeShift.ImportDeclaration);
    const toImportAST = (imp) =>
      jsCodeShift(`${imp}\n`).nodes()[0].program.body[0];
    const importASTNodes = imports.map(toImportAST);
    if (declarations.length) {
      declarations.at(-1).insertAfter(importASTNodes);
    } else {
      root.get().node.program.body.unshift(...importASTNodes);
    }
    return root.toSource();
  }
  
  module.exports = injectImports;