import prisma from "./src/lib/prisma.js";

async function test() {
  console.log("Prisma keys:", Object.keys(prisma).filter(k => !k.startsWith('_')));
}

test();
