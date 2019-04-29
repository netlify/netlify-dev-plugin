#!/usr/bin/env node

/* sync GraphQL schema to your FaunaDB account - use with `netlify dev:exec <path-to-this-file>` */
function createFaunaGraphQL() {
  if (!process.env.FAUNADB_SERVER_SECRET) {
    console.log("No FAUNADB_SERVER_SECRET in environment, skipping DB setup");
  }
  console.log("Upload GraphQL Schema!");

  const fetch = require("node-fetch");
  const fs = require("fs");
  const path = require("path");
  var dataString = fs
    .readFileSync(path.join(__dirname, "schema.graphql"))
    .toString(); // name of your schema file

  var options = {
    method: "POST",
    body: dataString,
    auth: {
      user: process.env.FAUNADB_SERVER_SECRET,
      pass: ""
    }
  };

  fetch("https://graphql.fauna.com/import", options)
    .then(body => {
      // // uncomment for debugging
      // console.log("body", body);
    })
    .catch(err => console.error("something wrong happened: ", { err }));
}

createFaunaGraphQL();
