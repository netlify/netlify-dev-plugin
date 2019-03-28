exports.handler = async (event, context) => {
  const path = event.path.replace(/\.netlify\/functions\/[^\/]+/, '')
  const segments = path.split('/').filter(e => e)

  switch (event.httpMethod) {
    case 'GET':
      if (segments.length === 0) {
        return require('./read-all').handler(event, context)
      }
      if (segments.length === 1) {
        event.id = segments[0]
        return require('./read').handler(event, context)
      }
    case 'POST':
      return require('./create').handler(event, context)
    case 'PUT':
      if (segments.length === 1) {
        event.id = segments[0]
        return require('./update').handler(event, context)
      }
    case 'DELETE':
      if (segments.length === 1) {
        event.id = segments[0]
        return require('./delete').handler(event, context)
      }
  }
  return { statusCode: 500, body: 'unrecognized HTTP Method, must be one of GET/POST/PUT/DELETE' }
}
