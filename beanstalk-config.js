const assert = require('assert')
const version = require('./package.json').version

const requiredEnv = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'REGISTRY_REPOSITORY',
]

requiredEnv.forEach(e => assert(e in process.env, `Missing env var ${e}`))

module.exports = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  version: version,
  region: process.env.AWS_REGION,
  appName: 'ISDCF-Registry-Server-EBS',
  CNAMEPrefix: "isdcf-registry",
  solutionStack: '64bit Amazon Linux 2 v5.0.2 running Node.js 12',
  tier: 'WebServer',
  environmentSettings: [
    {
      Namespace: 'aws:autoscaling:launchconfiguration',
      OptionName: 'IamInstanceProfile',
      Value: 'aws-elasticbeanstalk-ec2-role'
    },
    {
      Namespace: 'aws:elasticbeanstalk:application:environment',
      OptionName: 'REGISTRY_REPOSITORY',
      Value: process.env.REGISTRY_REPOSITORY
    },
  ],
  bucketConfig: { // passed into S3.createBucket()
    Bucket: `isdcf-registry-${version}`,
    CreateBucketConfiguration: {
      LocationConstraint: process.env.AWS_REGION
    },
  },
}
