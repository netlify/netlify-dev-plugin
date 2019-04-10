// not meant to be run inside the graqhql-gateway function
// but just shows a copy-pastable example sibling function
// that would work with graphql-gateway
const { ApolloServer, gql } = require("apollo-server-lambda");

const typeDefs = gql`
  type Query {
    hello: String
    allBooks: [Book]
    book(id: Int!): Book
  }
  type Book {
    id: ID!
    year: Int!
    title: String!
    authorName: String!
  }
`;

const books = [
  {
    id: 1,
    title: "The Philosopher's Stone",
    year: 1997,
    authorName: "JK Rowling"
  },
  {
    id: 2,
    title: "The Chamber of Secrets",
    year: 1998,
    authorName: "Stephen King"
  },
  {
    id: 3,
    title: "The Prisoner of Azkaban",
    year: 1999,
    authorName: "Terry Pratchett"
  },
  {
    id: 4,
    title: "The Goblet of Fire",
    year: 2000,
    authorName: "Terry Pratchett"
  },
  {
    id: 5,
    title: "The Order of the Phoenix",
    year: 2003,
    authorName: "Terry Pratchett"
  },
  {
    id: 6,
    title: "The Half-Blood Prince",
    year: 2005,
    authorName: "Stephen King"
  },
  {
    id: 7,
    title: "The Deathly Hallows",
    year: 2007,
    authorName: "Stephen King"
  }
];

const resolvers = {
  Query: {
    hello: (root, args, context) => {
      return "Hello, world!";
    },
    allBooks: (root, args, context) => {
      return books;
    },
    book: (root, args, context) => {
      return find(books, { id: args.id });
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

exports.handler = server.createHandler();
