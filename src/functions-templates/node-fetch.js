exports.metadata = {
  name: 'Fetch function: uses node-fetch to hit an external API without CORS issues',
  value: 'node-fetch',
  short: 'node-fetch'
}
exports.onComplete = () => {
  console.log(`node-fetch function created from template!`)
  console.log('REMINDER: make sure to install `node-fetch` if you dont have it.')
}

exports.templateCode = () => {
  return `
const fetch = require('node-fetch')
exports.handler = async function(event, context) {
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random')
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText }
    }
    const data = await response.json()

    return {
      statusCode: 200,
      body: JSON.stringify({ msg: data.value })
    }
  } catch (err) {
    console.log(err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    }
  }
}
`
}
