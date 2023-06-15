const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLNonNull,
} = require("graphql");

const app = express();

const authors = [
  { id: 1, name: "J. K. Rowling" },
  { id: 2, name: "J. R. R. Tolkien" },
  { id: 3, name: "Brent Weeks" },
];

const books = [
  { id: 1, name: "Harry Potter and the Chamber of Secrets", authorId: 1 },
  { id: 2, name: "Harry Potter and the Prisoner of Azkaban", authorId: 1 },
  { id: 3, name: "Harry Potter and the Goblet of Fire", authorId: 1 },
  { id: 4, name: "The Fellowship of the Ring", authorId: 2 },
  { id: 5, name: "The Two Towers", authorId: 2 },
  { id: 6, name: "The Return of the King", authorId: 2 },
  { id: 7, name: "The Way of Shadows", authorId: 3 },
  { id: 8, name: "Beyond the Shadows", authorId: 3 },
];

// const userSchema = new GraphQLSchema({
//   query: new GraphQLObjectType({
//     name: "user",
//     fields: () => ({
//       message: {
//         type: GraphQLString,
//         resolve: () => "Jasper Smith",
//       },
//     }),
//   }),
// });

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    authorId: { type: GraphQLInt },
    author: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((ax) => ax.id === book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLInt) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    books: {
      type: new GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((bx) => bx.authorId === author.id);
      },
    },
  }),
});

const rootSchema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    description: "GraphQL Root Query",
    fields: () => ({
      books: {
        type: new GraphQLList(BookType),
        resolve: () => books,
      },
      book: {
        type: BookType,
        args: {
          id: { type: GraphQLInt },
        },
        resolve: (parent, args) => books.find((bx) => bx.id === args.id),
      },
      authors: {
        type: new GraphQLList(AuthorType),
        resolve: () => authors,
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    description: "GraphQL Root Mutation",
    fields: () => ({
      addBook: {
        type: BookType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          authorId: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: (parent, args) => {
          const newBook = {
            id: books.length + 1,
            name: args.name,
            authorId: args.authorId,
          };
          books.push(newBook);
          return newBook;
        },
      },
      addAuthor: {
        type: AuthorType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: (parent, args) => {
          const newAuthor = {
            id: authors.length + 1,
            name: args.name,
          };
          authors.push(newAuthor);
          return newAuthor;
        },
      },
    }),
  }),
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: rootSchema,
    graphiql: true,
  })
);

app.listen(8443, () => {
  console.log("GraphQL Service is running!!");
});
