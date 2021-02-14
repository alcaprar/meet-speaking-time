const fs = require('fs');

const DIST_MANIFEST_PATH = "./dist/manifest.json"

const manifestContent = require(DIST_MANIFEST_PATH);
const packageJsonContent = require('./package.json');

manifestContent.version = packageJsonContent.version;

fs.writeFileSync(DIST_MANIFEST_PATH, JSON.stringify(manifestContent));