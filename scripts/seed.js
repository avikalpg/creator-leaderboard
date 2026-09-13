const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DEFAULT_SETTINGS = [
  { key: "window_days", value: "14", description: "Rolling days evaluated for consistency and medians" },
  { key: "min_posts_for_slope", value: "3", description: "Minimum posts required to compute view velocity" },
  { key: "slope_sample_size", value: "5", description: "Number of recent posts used for slope regression" },
  { key: "breakout_threshold", value: "3.0", description: "Multiplier over median to trigger breakout badge" },
  { key: "breakout_house_points", value: "25", description: "House points awarded per member breakout" },
  { key: "consistency_house_weight", value: "0.5", description: "Weight multiplier for individual consistency scores" },
  { key: "momentum_house_weight", value: "10.0", description: "Weight multiplier for median house slope" },
];

const INITIAL_CREATORS = [
  {
    name: "Avikalp Gupta",
    houseName: "House Matrix",
    instagramHandle: "contrarian.techie",
    youtubeHandle: "@contrariantechie",
    youtubeChannelId: "UCr2iGp2B1b20tJUzi8WhnAA",
    targetCadence: "DAILY",
    bio: "AI startup founder @thinking.ships | SPC & On Deck Fellow",
  },
  {
    name: "Sneha",
    houseName: "House Phoenix",
    instagramHandle: "chaiandcontext",
    targetCadence: "ALTERNATE",
    bio: "Product & branding breakdowns with chai & context",
  },
  {
    name: "Jenil Jain",
    houseName: "House Titan",
    instagramHandle: "thejeniljain",
    targetCadence: "ALTERNATE",
    bio: "The business of Business",
  },
  {
    name: "Neha Prabhu",
    houseName: "House Matrix",
    instagramHandle: "nehamuchhhh",
    targetCadence: "ALTERNATE",
    bio: "Intentional slice of life content | SDE @ ServiceNow",
  },
  {
    name: "Taher Lakdawala",
    houseName: "House Phoenix",
    instagramHandle: "testaheron",
    targetCadence: "ALTERNATE",
    bio: "Architecture software hacks & insights",
  },
  {
    name: "Mission Multilingual",
    houseName: "House Titan",
    instagramHandle: "missionmultilingual",
    targetCadence: "ALTERNATE",
    bio: "Languages & Travel across 49 countries",
  },
];

async function main() {
  console.log("Seeding settings...");
  for (const s of DEFAULT_SETTINGS) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  console.log("Seeding creators...");
  for (const c of INITIAL_CREATORS) {
    const existing = await prisma.creator.findFirst({
      where: {
        OR: [
          c.instagramHandle ? { instagramHandle: c.instagramHandle } : undefined,
          c.youtubeChannelId ? { youtubeChannelId: c.youtubeChannelId } : undefined,
        ].filter(Boolean),
      },
    });

    if (existing) {
      await prisma.creator.update({
        where: { id: existing.id },
        data: c,
      });
      console.log(`Updated creator: ${c.name}`);
    } else {
      await prisma.creator.create({
        data: c,
      });
      console.log(`Created creator: ${c.name}`);
    }
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
