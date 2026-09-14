require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ROSTER = [
  // Orvane
  {
    name: "Avikalp Gupta",
    houseName: "Orvane",
    instagramHandle: "contrarian.techie",
    youtubeHandle: "@contrariantechie",
    youtubeChannelId: "UCr2iGp2B1b20tJUzi8WhnAA",
    targetCadence: "DAILY",
    bio: "AI startup founder @thinking.ships | SPC & On Deck Fellow",
  },
  {
    name: "Saran",
    houseName: "Orvane",
    targetCadence: "ALTERNATE",
    bio: "GenC Creator Cohort • House Orvane",
  },
  {
    name: "Samarth",
    houseName: "Orvane",
    targetCadence: "ALTERNATE",
    bio: "GenC Creator Cohort • House Orvane",
  },
  {
    name: "Ojas",
    houseName: "Orvane",
    targetCadence: "ALTERNATE",
    bio: "GenC Creator Cohort • House Orvane",
  },
  {
    name: "Nihar",
    houseName: "Orvane",
    targetCadence: "ALTERNATE",
    bio: "GenC Creator Cohort • House Orvane",
  },

  // Kaelix
  {
    name: "Soundu",
    houseName: "Kaelix",
    instagramHandle: "techwithsoundu",
    youtubeHandle: "@TechWithSoundu",
    targetCadence: "ALTERNATE",
    bio: "Tech With Soundu • House Kaelix",
  },
  {
    name: "Nitin",
    houseName: "Kaelix",
    instagramHandle: "thehomeapplianceguy",
    targetCadence: "ALTERNATE",
    bio: "The Home Appliance Guy • House Kaelix",
  },

  // Myrith
  {
    name: "Taher Lakdawala",
    houseName: "Myrith",
    instagramHandle: "testaheron",
    targetCadence: "ALTERNATE",
    bio: "Architecture software hacks & insights • House Myrith",
  },
  {
    name: "Pradiptha",
    houseName: "Myrith",
    targetCadence: "ALTERNATE",
    bio: "GenC Creator Cohort • House Myrith",
  },

  // Unassigned / House pending
  {
    name: "Neha Prabhu",
    houseName: "Unassigned",
    instagramHandle: "nehamuchhhh",
    youtubeHandle: "@nehamuch",
    targetCadence: "ALTERNATE",
    bio: "Intentional slice of life content | SDE @ ServiceNow",
  },
  {
    name: "Mission Multilingual",
    houseName: "Unassigned",
    instagramHandle: "missionmultilingual",
    youtubeHandle: "@missionmultilingual",
    targetCadence: "ALTERNATE",
    bio: "Languages & Travel across 49 countries",
  },
  {
    name: "Sneha",
    houseName: "Unassigned",
    instagramHandle: "chaiandcontext",
    targetCadence: "ALTERNATE",
    bio: "Product & branding breakdowns with chai & context",
  },
  {
    name: "Jenil Jain",
    houseName: "Unassigned",
    instagramHandle: "thejeniljain",
    targetCadence: "ALTERNATE",
    bio: "The business of Business",
  },
  {
    name: "Scents Who Speak",
    houseName: "Unassigned",
    instagramHandle: "scents_who_speak",
    targetCadence: "ALTERNATE",
    bio: "Fragrance & Scents storytelling",
  },
  {
    name: "Orange Bulb Homes",
    houseName: "Unassigned",
    youtubeHandle: "@Orangebulbhomes",
    targetCadence: "ALTERNATE",
    bio: "Home design & aesthetics",
  },
  {
    name: "Sameer Ramteke",
    houseName: "Unassigned",
    youtubeHandle: "@sameerramteke5457",
    targetCadence: "ALTERNATE",
    bio: "Creator content",
  },
];

async function main() {
  console.log("Updating GenC Cohort roster in NeonDB...");
  for (const c of ROSTER) {
    // Check if creator exists by name or handles
    const existing = await prisma.creator.findFirst({
      where: {
        OR: [
          { name: c.name },
          c.instagramHandle ? { instagramHandle: c.instagramHandle } : undefined,
          c.youtubeHandle ? { youtubeHandle: c.youtubeHandle } : undefined,
        ].filter(Boolean),
      },
    });

    if (existing) {
      await prisma.creator.update({
        where: { id: existing.id },
        data: {
          houseName: c.houseName,
          targetCadence: c.targetCadence,
          bio: c.bio,
          ...(c.instagramHandle ? { instagramHandle: c.instagramHandle } : {}),
          ...(c.youtubeHandle ? { youtubeHandle: c.youtubeHandle } : {}),
        },
      });
      console.log(`Updated: ${c.name} -> House: ${c.houseName}`);
    } else {
      await prisma.creator.create({
        data: c,
      });
      console.log(`Created: ${c.name} -> House: ${c.houseName}`);
    }
  }

  console.log("Roster update completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
