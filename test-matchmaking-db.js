import prisma from "./src/lib/prisma.js";

async function checkTable() {
  try {
    const count = await prisma.matchQueue.count();
    console.log("MatchQueue table exists, row count:", count);
  } catch (e) {
    console.error("MatchQueue table ACCESS ERROR:", e.message);
  } finally {
    process.exit();
  }
}

checkTable();
