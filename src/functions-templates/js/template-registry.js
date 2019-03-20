// every object should have:
// //  a 'name' field that corresponds to a folder
// // "description" is just what shows in the CLI but we use the name as the identifier
// onComplete is optional.
// priority is optional - for controlling what shows first in CLI
module.exports = [
  {
    name: 'auth-fetch',
    description: 'Authenticated Fetch: uses node-fetch and Netlify Identity to access APIs',
    onComplete() {
      console.log(`authenticated node-fetch function created from template!`)
      console.log(
        'REMINDER: Make sure to call this function with the Netlify Identity JWT. See https://netlify-gotrue-in-react.netlify.com/ for demo'
      )
    }
  },
  {
    name: 'hello-world',
    priority: 1,
    description: 'Basic Hello World function: shows async/await usage, and response formatting'
  },
  {
    name: 'node-fetch',
    description: 'Fetch function: uses node-fetch to hit an external API without CORS issues',
    onComplete() {
      console.log(`node-fetch function created from template!`)
    }
  },
  {
    name: 'serverless-ssr',
    description: 'Serverless SSR: dynamic serverside rendering via functions',
    onComplete() {
      console.log(`serverless-ssr function created from template!`)
    }
  },
  {
    name: 'set-cookie',
    description: 'Set Cookie: set a cookie alongside your function',
    onComplete() {
      console.log(`set-cookie function created from template!`)
    }
  },
  {
    name: 'protected-function',
    description: 'Protected Function: Function behind Netlify Identity',
    onComplete() {
      console.log(`protected-function function created from template!`)
    }
  },
  {
    name: 'using-middleware',
    description: 'Using Middleware: with middy',
    onComplete() {
      console.log(`using-middleware function created from template!`)
    }
  },
  {
    name: 'fauna-crud',
    description: 'CRUD function: using Fauna DB!',
    addons: ['fauna'], // in future we'll want to pass/prompt args to addons
    onComplete() {
      console.log(`fauna-crud function created from template!`)
    }
  },
  {
    name: 'apollo-graphql',
    description: 'GraphQL function: using Apollo-Server-Lambda!',
    onComplete() {
      console.log(`apollo-graphql function created from template!`)
    }
  }
]
