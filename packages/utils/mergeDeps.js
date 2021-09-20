function mergeDeps(sourceDeps, depsToInject) {
  const result = Object.assign({}, sourceDeps);
  for (const key in depsToInject) {
    if (Object.hasOwnProperty.call(depsToInject, key)) {
      result[key] = depsToInject[key];
    }
  }
  return result;
}
module.exports = mergeDeps;
