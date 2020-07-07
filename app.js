#!/usr/bin/env node

const http = require('http')
const express = require('express')
const die = e => { console.error(e); process.exit(1) }
const { getUpstreamRegistry } = require('./lib/upstream')
const app = express().disable('x-powered-by').set("json spaces", 4)
const server = http.createServer(app)
const { description, version } = require('./package.json')

const PORT = Number(process.env.PORT || 80)
const REGISTRY_REPOSITORY = process.env.REGISTRY_REPOSITORY || die("Missing REGISTRY_REPOSITORY")

const sendRegistry = (res, reg) => {
  res.status(200)
    .set("Last-Modified", reg.date.toUTCString())
    .send({
      schemaVersion: reg.schemaVersion,
      isLatestData: reg.isHead,
      lastModified: reg.date.toISOString(),
      data: reg.data,
    })
}

void (async () => {

  // pull in the upstream registry repository:
  app.locals.registries = await getUpstreamRegistry(REGISTRY_REPOSITORY)

  // launch web server:
  await { then(res, rej) {
    server.listen(PORT);
    server.on('listening', res).on('error', rej)
  } }

  console.log("Listening at http://localhost%s/", PORT === 80 ? '' : `:${PORT}`)

  // index of all versions of all registries:
  app.get("/", (req,res) => {

    const registries = Object.keys(app.locals.registries).map(name => {
        const schemaVersions = app.locals.registries[name].map(s => s.schemaVersion)
        return [ `/${name}/`, ...schemaVersions.map(v => `/${name}/${v}/`) ]
    }).flat()

    res.status(200).send({ description, version, registries })
  })

  // create a route for the latest version of each registry:
  app.get("/:registry", (req, res, next) => {
    const versions = app.locals.registries[req.params.registry]
    if (!versions) return next()
    sendRegistry(res, versions[0])
  })

  // create a route for each version of each registry:
  app.get("/:registry/:schemaVersion", (req, res, next) => {
    if (!app.locals.registries[req.params.registry]) return next()

    const registry = app.locals.registries[req.params.registry]
          .find(i => i.schemaVersion === req.params.schemaVersion)

    if (!registry) return next()
    sendRegistry(res, registry)
  })

  // allow GitHub to trigger this server to pull the latest from upstream master
  app.post("/upstream", async (req, res) => {
    if (!req.header("User-Agent").includes("GitHub-Hookshot"))
      res.status(404).send("Not Found")
    try {
      console.log(`Pulling latest changes from ${REGISTRY_REPOSITORY}`)
      app.locals.registries = await getUpstreamRegistry(REGISTRY_REPOSITORY)
      res.status(204).send("")
    }
    catch (e) {
      console.error(e)
      res.status(500).send(e.message || e)
    }
  })

})().catch(die)
