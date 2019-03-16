exports.metadata = {
  name: 'Serverless HTTP: dynamic serverside rendering via functions',
  value: 'serverless-http',
  short: 'serverless-http'
}
exports.onComplete = () => {
  console.log(`serverless-http function created from template!`)
  console.log('REMINDER: Make sure to `npm install serverless-http express cors morgan body-parser compression`.')
}
exports.copyAssets = ['app/index.js']

exports.templateCode = () => {
  return `
// for a full working demo check https://express-via-functions.netlify.com/.netlify/functions/serverless-http
const serverless = require('serverless-http')
const expressApp = require('./app')

// We need to define our function name for express routes to set the correct base path
const functionName = 'serverless-http'

// Initialize express app
const app = expressApp(functionName)

// Export lambda handler
exports.handler = serverless(app)
`
}
