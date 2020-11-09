/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs')
const distPath = './dist'
const buildPath = './build'

try {
  fs.rmdirSync(distPath, { recursive: true })
  fs.rmdirSync(buildPath, { recursive: true })
} catch (err) {
  console.error(`There was an error deleting directories! ${err}`)
}