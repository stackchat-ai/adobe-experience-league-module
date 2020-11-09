/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs')
const prettier = require('prettier')

/**
 * Port of the following npm build script to Node so that it runs on both Windows and Mac
 * mkdir -p dist && cat build/* > build/_output.js && cat build/_output.js | grep -v '^\\(import \\)' > build/_filtered-output.js && prettier build/_filtered-output.js > dist/cloud-functions.js
 */
const distPath = './dist'
const buildPath = './build'
const prettierOpts = prettier.resolveConfig.sync('.prettierrc.json');

try {
  fs.rmdirSync(distPath, { recursive: true })
  fs.rmdirSync(buildPath, { recursive: true })

  let output = ''
  fs.mkdirSync(distPath)
  const files = fs.readdirSync(buildPath)
  files.forEach(file => {
    output += fs.readFileSync(`${buildPath}/${file}`)
  });

  output = output.replace(/^import .*/gm, '') //remove import statements
  const formattedString = prettier.format(output, prettierOpts || {})
  fs.writeFileSync(`${distPath}/cloud-functions.js`, formattedString)
} catch (err) {
  console.error(`There was an error! ${err}`)
}