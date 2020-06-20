const path = require('path')
const { mkdir, readFile, readdir } = require('fs').promises
const { promisify } = require('util')
const execFile = promisify(require('child_process').execFile)
const die = e => { console.error(e); process.exit(1) }

const REPO_DIR = 'registries'
const BUILD_PATH = path.join(__dirname, '../build')
const REPO_PATH = path.join(BUILD_PATH, REPO_DIR)
const SCHEMA_PATH = path.join(REPO_PATH, "src/main/schemas/")
const DATA_PATH = path.join(REPO_PATH, "src/main/data/")

async function getUpstreamRegistry(repoUrl) {
  await mkdir(BUILD_PATH, { recursive: true })
  process.chdir(BUILD_PATH)

  await execFile('rm', [ '-rf', REPO_DIR ])
  await execFile('git', [ 'clone', repoUrl, REPO_DIR ])

  // list the schema directory to determine all possible feeds:
  const schemaFiles = await readdir(SCHEMA_PATH)

  return await schemaFiles.reduce(async (aProm, schemaFile) => {
    const a = await aProm
    const name = path.basename(schemaFile, ".schema.json")

    await execFile('git', [ "checkout", "master" ], { cwd: REPO_PATH, error: die })

    // list all versions of schemaFile (ignore the first, since we'll do head below)
    const [ _, ...oldSchemaLogs ] = (await execFile('git', [
      'log', '--pretty=format:%h %at', '--', `src/main/schemas/${schemaFile}`
    ], { cwd: REPO_PATH, error: die })).stdout.split("\n")

    // get HEAD in the same format as above:
    const [ headLog ] = (await execFile('git', [
      'log', '--pretty=format:%h %at', '--'
    ], { cwd: REPO_PATH, error: die })).stdout.split("\n")

    const versionsDups = await [ headLog, ...oldSchemaLogs ].reduce(async (aProm, log, i) => {
      const a = await aProm
      const [ hash, commitUnixTime ] = log.split(' ') // see "%h %at"above
      await execFile('git', [ "checkout", hash ], { cwd: REPO_PATH, error: die })
      const data = JSON.parse(await readFile(path.join(DATA_PATH, `${name}.json`)))
      const { $id } = JSON.parse(await readFile(path.join(SCHEMA_PATH, schemaFile)))
      const schemaVersion = path.basename($id)
      return [ ...a, { data, schemaVersion, date: new Date(commitUnixTime*1000), isHead: i === 0 } ]
    }, Promise.resolve([]))

    // Where there are duplicate schemaVersions, select the latest. These
    // correspond to cases where the schema file was committed without
    // changes to its $id:

    const versions = Object.values(versionsDups.reduce((a,v) => {
      if (!a[v.schemaVersion]) a[v.schemaVersion] = []
      a[v.schemaVersion].push(v)
      return a
    }, {})).map(grp => grp.sort((a,b) => b.date - a.date)[0]).flat()

    return { ...a, [name]: versions }
  }, Promise.resolve({}))
}

module.exports = { getUpstreamRegistry }
