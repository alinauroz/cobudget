const KcAdminClient = require('keycloak-admin').default;

module.exports = {
  async up(db, client) {
    // TODO write your migration here.
    // See https://github.com/seppevs/migrate-mongo/#creating-a-new-migration-script
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: true}});

    // To configure the client, pass an object to override any of these  options:

    const kcAdminClient = new KcAdminClient({
      baseUrl: 'https://auth.platoproject.org/auth',
      realmName: 'master',
      requestConfig: {
        /* Axios request config options https://github.com/axios/axios#request-config */
      },
    });

    // Authorize with username / password
    await kcAdminClient.auth({
      username: 'admin',
      password: 'xxx',
      grantType: 'password',
      clientId: 'admin-cli',
      totp: '123456', // optional Time-based One-time Password if OTP is required in authentication flow
    });

    kcAdminClient.setConfig({
      realmName: 'plato',
    });

    // List all users
    const keycloakUsers = await kcAdminClient.users.find();
    console.log({ keycloakUsers });
    const orgmembers = await db.collection('orgmembers').find({});

    for await (const orgMember of orgmembers) {
      const orgMemberInKeycloak = keycloakUsers.find(
        (user) => user.email == orgMember.email
      );

      if (orgMemberInKeycloak) {
        await db.collection('orgmembers').updateOne(
          { _id: orgMember._id },
          {
            $set: {
              userId: orgMemberInKeycloak.id,
            },
          }
        );
        // update member to have
        // save orgMemberInKeycloak.id to or
        // orgMember.userId == orgMemberInKeycloak.id
        // orgMember.save()
      } else {
        // if name exists
        // take that, trim() and remove spaces.
        // and lowercase?
        let username;
        if (orgMember.name) {
          username = orgMember.name.replace(/\s+/g, '').toLowerCase();
        } else {
          username = orgMember.email.split('@')[0];
        }
        if (keycloakUsers.find((user) => user.username == username)) {
          username = username + orgMember._id.toString().substr(-3);
        }

        const user = await kcAdminClient.users.create({
          username,
          email: orgMember.email,
          // enabled required to be true in order to send actions email
          emailVerified: orgMember.verifiedEmail,
          enabled: true,
        });

        await db.collection('orgmembers').updateOne(
          { _id: orgMember._id },
          {
            $set: {
              userId: user.id,
            },
          }
        );
      }
    }

    // look if orgMember.email is in keycloak as a user
    // if not: add new keycloak user with email as their email, and username as their name without spaces or something.

    // await db
    // .collection('eventmembers')
    // .update(
    //   {},
    //   { $rename: { userId: 'orgMemberId' } },
    //   { multi: true },
    //   function (err, blocks) {
    //     if (err) {
    //       throw err;
    //     }
    //   }
    // );
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  },
};
// mongoexport --uri="MONGO_URI"  --collection=users  --out=users.json
// mongoimport --uri="MONGO_URI" -c=orgmembers --file=users.json
