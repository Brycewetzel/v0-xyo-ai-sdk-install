module.exports = {
  hooks: {
    readPackage(pkg) {
      // Ensure ws is available for packages that depend on it
      if (pkg.name === 'ethers') {
        if (!pkg.peerDependencies) {
          pkg.peerDependencies = {}
        }
        pkg.peerDependencies.ws = '>=8.0.0'
      }
      return pkg
    },
  },
}
