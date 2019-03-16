exports.metadata = {
  name: 'Authenticated Fetch: uses node-fetch and Netlify Identity to access APIs',
  value: 'auth-fetch',
  short: 'auth-fetch'
}
exports.onComplete = () => {
  console.log(`authenticated node-fetch function created from template!`)
  console.log('REMINDER: Make sure to install `node-fetch` if you dont have it.')
  console.log(
    'REMINDER: Make sure to call this function with the Netlify Identity JWT. See https://netlify-gotrue-in-react.netlify.com/ for demo'
  )
}

exports.templateCode = () => {
  return `
// for a full working demo of Netlify Identity + Functions, see https://netlify-gotrue-in-react.netlify.com/

const fetch = require('node-fetch')
exports.handler = async function(event, context) {
  if (!context.clientContext && !context.clientContext.identity) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        msg:
          'No identity instance detected. Did you enable it?'
      }) // Could be a custom message or object i.e. JSON.stringify(err)
    };
  }
  const { identity, user } = context.clientContext;
  try {
    const response = await fetch('https://api.chucknorris.io/jokes/random');
    if (!response.ok) {
      // NOT res.status >= 200 && res.status < 300
      return { statusCode: response.status, body: response.statusText };
    }
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ identity, user, msg: data.value })
    };
  } catch (err) {
    console.log(err); // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({ msg: err.message }) // Could be a custom message or object i.e. JSON.stringify(err)
    };
  }
}
`
}
