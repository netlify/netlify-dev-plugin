const { ApolloServer, gql } = require("apollo-server-lambda");
const { createHttpLink } = require("apollo-link-http");
const fetch = require("node-fetch");
const {
  introspectSchema,
  makeRemoteExecutableSchema
} = require("graphql-tools");

exports.handler = function(event, context, cb) {
  /** required for Fauna GraphQL auth */
  if (!process.env.FAUNADB_SERVER_SECRET) {
    const msg = `
    FAUNADB_SERVER_SECRET missing. 
    Did you forget to install the fauna addon or forgot to run inside Netlify Dev?
    `;
    console.error(msg);
    return {
      statusCode: 500,
      body: JSON.stringify({ msg })
    };
  }
  const b64encodedSecret = Buffer.from(
    process.env.FAUNADB_SERVER_SECRET + ":" // weird but they
  ).toString("base64");
  const headers = { Authorization: `Basic ${b64encodedSecret}` };

  /** standard creation of apollo-server executable schema */
  const link = createHttpLink({
    uri: "https://graphql.faunadb.net/graphql", // modify as you see fit
    fetch,
    headers
  });
  introspectSchema(link).then(schema => {
    const executableSchema = makeRemoteExecutableSchema({
      schema,
      link
    });
    const server = new ApolloServer({
      schema: executableSchema
    });
    server.createHandler()(event, context, cb);
  });
};
