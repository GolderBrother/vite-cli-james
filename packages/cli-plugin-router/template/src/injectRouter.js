module.exports = (file, api) => {
    const jscodeshift = api.jscodeshift;
    const root = jscodeshift(file.source);
    const appImportDeclaration = root.find(
      jscodeshift.ImportDeclaration,
      (node) => {
        if (node.specifiers[0].local.name === "App") {
          return true;
        }
      }
    );
    if (appImportDeclaration) appImportDeclaration.remove();
  
    const appJSXElement = root.find(jscodeshift.JSXElement, (node) => {
      if (node.openingElement.name.name === "App") {
        return true;
      }
    });
    if (appJSXElement)
      appJSXElement.replaceWith(({ node }) => {
        return jscodeshift.jsxElement(
          jscodeshift.jsxOpeningElement(jscodeshift.jsxIdentifier("Router")),
          jscodeshift.jsxClosingElement(jscodeshift.jsxIdentifier("Router")),
          [
            jscodeshift.jsxExpressionContainer(
              jscodeshift.callExpression(jscodeshift.identifier("renderRoutes"), [
                jscodeshift.identifier("routesConfig"),
              ])
            ),
          ],
          false
        );
      });
    return root.toSource();
  };