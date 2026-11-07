import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/helpars/slug";

const prisma = new PrismaClient();

async function main() {
    const shops = await prisma.shop.findMany({
        where: { slug: null },
        select: { id: true, name: true },
    });

    for (const shop of shops) {
        const base = slugify(shop.name);
        let candidate = base;

        for (let attempt = 1; attempt < 50; attempt += 1) {
            const taken = await prisma.shop.findFirst({
                where: { slug: candidate, NOT: { id: shop.id } },
                select: { id: true },
            });
            if (!taken) break;
            candidate = `${base}-${attempt + 1}`;
        }

        await prisma.shop.update({
            where: { id: shop.id },
            data: { slug: candidate },
        });
        console.log(`${shop.name} -> ${candidate}`);
    }

    console.log(`done, ${shops.length} shop(s) updated`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
