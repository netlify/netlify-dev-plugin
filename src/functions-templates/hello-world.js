// --- Netlify Template Metadata -- //
exports.metadata = {
  name: 'Basic Hello World function: shows async/await usage, and proper formatting with statusCode and body',
  value: 'hello-world',
  short: 'hello-world'
}
// --- Netlify Template Below -- //
async function hello() {
  return Promise.resolve('Hello, World')
}

exports.handler = async function(event, context) {
  try {
    const body = await hello()
    return { statusCode: 200, body }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
