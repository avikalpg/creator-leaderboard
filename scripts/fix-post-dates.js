require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function getInstagramTimestamp(shortcode) {
  if (!shortcode) return null;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let mediaId = BigInt(0);
  for (let i = 0; i < shortcode.length; i++) {
    const idx = alphabet.indexOf(shortcode[i]);
    if (idx === -1) return null;
    mediaId = (mediaId * BigInt(64)) + BigInt(idx);
  }
  const timestampMs = Number((mediaId >> BigInt(23)) + BigInt(1314220021721));
  const date = new Date(timestampMs);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  console.log("=== Fixing Instagram Post Publication Dates via Snowflake IDs ===");
  const posts = await prisma.postSnapshot.findMany({
    where: { platform: "INSTAGRAM" },
    include: { creator: true }
  });

  console.log(`Found ${posts.length} Instagram posts in database.`);

  let updatedCount = 0;
  for (const p of posts) {
    const realDate = getInstagramTimestamp(p.externalId);
    if (!realDate) continue;

    // Compare with current stored date
    const diffDays = Math.abs(p.publishedAt.getTime() - realDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 0.5) {
      await prisma.postSnapshot.update({
        where: { id: p.id },
        data: { publishedAt: realDate }
      });
      console.log(`Updated ${p.creator.name} - [${p.externalId}]: ${p.publishedAt.toISOString().split("T")[0]} -> ${realDate.toISOString().split("T")[0]} (views: ${p.views.toLocaleString()})`);
      updatedCount++;
    }
  }

  console.log(`\nSuccessfully corrected publication dates for ${updatedCount} posts!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
