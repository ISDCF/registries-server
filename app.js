#!/usr/bin/env node

const server = require('./lib/server')

void (async () => {
  const { url } = await server.launch()
  console.log(`Listening at ${url}`)
})().catch(e => { console.error(e); process.exit(1) })
