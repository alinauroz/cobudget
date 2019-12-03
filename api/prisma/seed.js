const { Photon } = require('@prisma/photon');
const photon = new Photon();

async function main() {
  const event = await photon.events.create({
    data: {
      slug: 'microburn',
      title: 'Micro Burn 2020',
      memberships: {
        create: [
          {
            isActive: true,
            isApproved: true,
            isAdmin: true,
            user: { create: { email: 'alice@gmail.com', name: 'Alice' } }
          }
        ]
      }
    }
  });
  console.log({ event });
}

main().finally(async () => {
  await photon.disconnect();
});
