import { ApolloServer } from 'apollo-server';
// import mongoose from 'mongoose';
import 'dotenv/config';
import { Photon } from '@prisma/photon';
import schema from './schema';
import resolvers from './resolvers';
// import models from './models';

const photon = new Photon();

// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context: async () => ({
    photon,
    currentUser: await photon.users.findOne({
      where: { email: 'alice@gmail.com' }
    })
  }),
  playground: true,
  introspection: true,
  cors: true
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
