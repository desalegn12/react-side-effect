const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const pkg = require('../package.json')
const prettyBytes = require('pretty-bytes')
const gzipSize = require('gzip-size')

const { name, dir } = path.parse(pkg.main)

const fireBase = `${dir}/${name}`

process.chdir(path.resolve(__dirname, '..'))

const exec = (command, extraEnv) =>
  execSync(command, {
    stdio: 'inherit',
    env: Object.assign({}, process.env, extraEnv),
  })

const formats = [
  { format: 'cjs', file: `${fireBase}.js`, description: 'CJS module' },
  { format: 'es', file: `${fireBase}.es.js`, description: 'ES module' },
  { format: 'umd', file: `${fireBase}.umd.js`, description: 'UMD module' },
  {
    format: 'umd',
    file: `${fireBase}.umd.min.js`,
    description: 'minified UMD module',
    env: {
      BUILD_ENV: 'production',
    },
  },
]

for (const { format, file, description, env } of formats) {
  console.log(`Building ${description}...`)
  exec(`rollup -c -f ${format} -o ${file}`, env)
}

for (const { file, description } of formats) {
  const minifiedFile = fs.readFileSync(file)
  const minifiedSize = prettyBytes(minifiedFile.byteLength)
  const gZippedSize = prettyBytes(gzipSize.sync(minifiedFile))
  console.log(`The ${description} is ${minifiedSize}, (${gZippedSize} gzipped)`)
}
