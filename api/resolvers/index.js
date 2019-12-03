import _ from 'lodash';
import slugify from 'slugify';

const resolvers = {
  Query: {
    currentUser: (parent, args, { currentUser }) => {
      return currentUser;
    },
    events: async (parent, args, { photon }) => {
      return photon.events.findMany();
    },
    event: async (parent, { slug }, { photon }) => {
      return photon.events.findOne({ where: { slug } });
    },
    dream: async (parent, { slug }, { photon }) => {
      return photon.dreams.findOne({ where: { slug } });
    }
  },
  Mutation: {
    createEvent: async (
      parent,
      { slug, title, description },
      { currentUser, photon }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      return await photon.events.create({
        data: {
          title,
          slug,
          description,
          memberships: {
            create: [
              {
                isAdmin: true,
                user: { connect: { id: currentUser.id } }
              }
            ]
          }
        }
      });
    },
    createDream: async (
      parent,
      { eventId, title, description, budgetDescription, minFunding },
      { currentUser, photon }
    ) => {
      if (!currentUser) throw new Error('You need to be logged in');

      return await photon.dreams.create({
        data: {
          title,
          slug: slugify(title),
          description,
          budgetDescription,
          minFunding,
          team: {
            connect: [{ id: currentUser.id }]
          },
          event: {
            connect: {
              id: eventId
            }
          }
        }
      });
    },
    createUser: async (parent, { name, email }, { photon }) => {
      return photon.users.create({
        data: {
          name,
          email
        }
      });
    }
  },
  User: {
    memberships: async (user, args, { photon }) => {
      return photon.users.findOne({ where: { id: user.id } }).memberships();
    }
  },
  Membership: {
    user: async (membership, args, { photon }) => {
      return photon.memberships
        .findOne({ where: { id: membership.id } })
        .user();
    },
    event: async (membership, args, { photon }) => {
      return photon.memberships
        .findOne({ where: { id: membership.id } })
        .event();
    }
  },
  Event: {
    memberships: async (event, args, { photon }) => {
      return photon.events.findOne({ where: { id: event.id } }).memberships();
    },
    dreams: async (event, args, { photon }) => {
      return photon.events.findOne({ where: { id: event.id } }).dreams();
    }
  },
  Dream: {
    team: async (dream, args, { photon }) => {
      return photon.dreams.findOne({ where: { id: dream.id } }).team();
    },
    event: async (dream, args, { photon }) => {
      return photon.dreams.findOne({ where: { id: dream.id } }).event();
    }
  }
};

export default resolvers;
