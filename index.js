const { PrismaClient } = require('@prisma/client');
const { ApolloServer } = require('apollo-server');

const { user, post } = new PrismaClient();

const typeDefs = `
  type User {
    id: Int!
    username: String!
    email: String!
    password: String!
    post: [Post]
    profile: Profile
    likes: [Likes]
    comments: [Comments]
  }

  type Profile {
    id: Int!
    bio: String
    user: User
  }

  type Post {
    id: Int!
    title: String!
    content: String
    author: [User]
    likes: Likes
    comments: Comments
  }

  type Likes {
    id: Int!
    count: Int!
    post: Post
    user: User
  }

  type Comments {
      id: Int!
      comments: String
      post: Post
      user: User
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
    posts: [Post!]!
    post(id: Int!): Post
  }

  type Mutation {
    user(username: String!, email: String!, password: String!): User
    post(title: String!, content: String, authorCreatedId: Int!): Post
    deletePost(id: Int!): Post
  }
`;
const resolvers = {
  Query: {
    users: () => {
      return user.findMany();
    },

    user: (parent, args, ctx) => {
        return user.findUnique({
            where: {
                id: args.id
            }
        })
    },
    posts: () => {
        return post.findMany();
    },
    post: (parent, args, ctx) => {
        return post.findUnique({
            where: {
                id: args.id
            }
        })
    },
    
  },

  Mutation: {
      user: (parent, args, ctx) => {
          return user.create({
              data: {
                  username: args.username,
                  email: args.email,
                  password: args.password
              }
          })
      },
      deletePost: (parent, args, ctx) => {
        return post.delete({
            where: {
                id: args.id
            }
        })
      },
      post: async (parent, args, ctx) => {
          
          const userFind = await user.findUnique({
              where: {
                  id: args.authorCreatedId
              }
          });
          console.log(args.authorCreatedId === userFind.id, "parent = ",parent.id, args.authorCreatedId, userFind.id, userFind);
          if(args.authorCreatedId === userFind.id) {
            const createPost = await post.create({
                data: {
                    title: args.title,
                    content: args.content,
                    authorId: args.authorCreatedId,
                    author: userFind
                },
                select: {
                    title: true,
                    content: true
                    
                }
            });
            return createPost;
        } else {
            return "Error";
        }
      }
  }
};
const server = new ApolloServer({ resolvers, typeDefs });
server.listen({ port: 4000 });