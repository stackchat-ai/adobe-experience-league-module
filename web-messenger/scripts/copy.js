const fs = require('fs-extra')
try {
  fs.copySync('./html', './dist')
  console.log('copy success!')
} catch (err) {
  console.error(err)
}