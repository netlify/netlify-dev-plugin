exports.priority = 1
exports.metadata = {
  name: 'Basic Hello World function: shows async/await usage, and response formatting',
  value: 'hello-world',
  short: 'hello-world'
}
exports.templateCode = () => {
  return `
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
`
}
