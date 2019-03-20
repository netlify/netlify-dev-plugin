exports.handler = async (event, context, callback) => {
  const { action } = event.queryStringParameters
  switch (action) {
    case 'create':
      return require('./create').handler(event, context, callback)
    case 'read':
      return require('./read').handler(event, context, callback)
    case 'update':
      return require('./update').handler(event, context, callback)
    case 'delete':
      return require('./delete').handler(event, context, callback)
  }
  return { statusCode: 500, body: 'unrecognized action ' + action }
}
