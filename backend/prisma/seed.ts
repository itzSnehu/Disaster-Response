import { PrismaClient, Role, DisasterStatus, ResourceType } from '@prisma/client';

const prisma = new PrismaClient();

const DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_CONTRIBUTOR_ID = '00000000-0000-0000-0000-000000000002';

async function main() {
  console.log('🌱 Starting Prisma database seed...');

  // Create demo profiles
  const adminProfile = await prisma.profile.upsert({
    where: { id: DEMO_ADMIN_ID },
    update: { role: Role.ADMIN, email: 'admin@example.com' },
    create: {
      id: DEMO_ADMIN_ID,
      email: 'admin@example.com',
      role: Role.ADMIN,
    },
  });

  const contributorProfile = await prisma.profile.upsert({
    where: { id: DEMO_CONTRIBUTOR_ID },
    update: { role: Role.CONTRIBUTOR, email: 'contributor@example.com' },
    create: {
      id: DEMO_CONTRIBUTOR_ID,
      email: 'contributor@example.com',
      role: Role.CONTRIBUTOR,
    },
  });

  console.log(`✅ Demo Admin Profile: ${adminProfile.id}`);
  console.log(`✅ Demo Contributor Profile: ${contributorProfile.id}`);

  // Create sample disaster incidents with geocoded coordinates
  const sampleDisaster1 = await prisma.disaster.create({
    data: {
      title: 'Manhattan Flooding',
      description: 'Heavy flooding has affected low-lying areas of Manhattan, NYC.',
      location: 'Manhattan, NYC',
      latitude: 40.7831,
      longitude: -73.9712,
      tags: ['flood', 'water', 'urban'],
      status: DisasterStatus.ACTIVE,
      createdBy: adminProfile.id,
    },
  });

  const sampleDisaster2 = await prisma.disaster.create({
    data: {
      title: 'Wildfire near San Jose',
      description: 'Containment efforts underway for brush fire spreading near foothills.',
      location: 'San Jose, CA',
      latitude: 37.3382,
      longitude: -121.8863,
      tags: ['wildfire', 'fire', 'evacuation'],
      status: DisasterStatus.ACTIVE,
      createdBy: contributorProfile.id,
    },
  });

  console.log(`✅ Sample Disaster 1 created: ${sampleDisaster1.id} (Manhattan)`);
  console.log(`✅ Sample Disaster 2 created: ${sampleDisaster2.id} (San Jose)`);

  // Seed emergency resources around Manhattan coordinates (40.7831, -73.9712)
  const resources = [
    {
      name: 'Central Emergency Shelter A',
      type: ResourceType.SHELTER,
      latitude: 40.785,
      longitude: -73.97, // ~0.24 km from disaster
    },
    {
      name: 'Manhattan General Hospital B',
      type: ResourceType.HOSPITAL,
      latitude: 40.79,
      longitude: -73.965, // ~0.92 km from disaster
    },
    {
      name: 'Clean Water Distribution Point C',
      type: ResourceType.WATER,
      latitude: 40.82,
      longitude: -73.94, // ~4.81 km from disaster
    },
    {
      name: 'Northern Relief Food Hub D',
      type: ResourceType.FOOD,
      latitude: 40.85,
      longitude: -73.91, // ~9.04 km from disaster
    },
    {
      name: 'Regional Rescue Operations Base E',
      type: ResourceType.RESCUE,
      latitude: 41.0,
      longitude: -73.8, // ~28.2 km from disaster (Outside 10km radius)
    },
  ];

  for (const res of resources) {
    const createdRes = await prisma.resource.create({ data: res });
    console.log(`✅ Seeded Resource [${createdRes.type}]: ${createdRes.name} (${createdRes.id})`);
  }

  console.log('🌱 Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
