#!/usr/bin/env node

const { promisify } = require('util')
const http = require('http')
const execFile = promisify(require('child_process').execFile);
const awsBeanstalk = require("node-aws-beanstalk")
const beanstalkConfig = require("../beanstalk-config.js")

const appUrl = `http://${beanstalkConfig.CNAMEPrefix}.${beanstalkConfig.region}.elasticbeanstalk.com/`
const waitTime = 10 * 60 * 1000 // 10 min

async function isServiceUp(url) {
  try {
    const { statusCode } = await new Promise((res,rej) => {
      const request = http.get(url, res)
      request.on('error', rej)
    })
    return statusCode === 200
  }
  catch(e) {
    return false;
  }
}

void (async () => {
  await execFile('git', ['archive', '--format', 'zip', '-o', 'build/pkg.zip', 'master' ])

  awsBeanstalk.deploy('./build/pkg.zip', beanstalkConfig, async (e, msg) => {
    if (e) {
      console.warn(e)
      process.exit(1)
    }

    const timer = setTimeout(() => {
      console.error("Timed out waiting for service to start");
      process.exit(1)
    }, waitTime)

    while (! await isServiceUp(appUrl)) {
      console.log(`${appUrl} is down. Waiting...`)
      await new Promise(r => setTimeout(r, 2000))
    }

    clearTimeout(timer)
    console.log(`Service is up at ${appUrl}`)
  });

})().catch(e => console.error)
