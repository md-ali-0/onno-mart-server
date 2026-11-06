import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
    CATEGORY_PHOTOS,
    PRODUCT_PHOTOS,
    categoryImage,
    productImage,
    wordmark,
} from './catalogue-images';

const prisma = new PrismaClient();

/**
 * Non-destructive migration for an already-seeded database: replaces the
 * random picsum.photos URLs with the curated catalogue imagery. Re-running the
 * full seed would wipe orders and reviews, so this only touches image columns.
 */
async function main() {
    let products = 0;
    let categories = 0;

    for (const slug of Object.keys(PRODUCT_PHOTOS)) {
        const product = await prisma.product.findUnique({
            where: { slug },
            include: { images: true },
        });
        if (!product) {
            console.warn(`skip unknown product: ${slug}`);
            continue;
        }

        await prisma.product.update({
            where: { slug },
            data: { thumbnail: productImage(slug) },
        });

        const gallery = [1, 2, 3].map((variant) => productImage(slug, variant));
        for (const [index, image] of product.images.entries()) {
            await prisma.image.update({
                where: { id: image.id },
                data: { url: gallery[index % gallery.length] },
            });
        }
        for (let index = product.images.length; index < 3; index += 1) {
            await prisma.image.create({
                data: { url: gallery[index], productId: product.id },
            });
        }
        products += 1;
    }

    for (const slug of Object.keys(CATEGORY_PHOTOS)) {
        const result = await prisma.category.updateMany({
            where: { slug },
            data: { image: categoryImage(slug) },
        });
        categories += result.count;
    }

    for (const brand of await prisma.brand.findMany()) {
        await prisma.brand.update({
            where: { id: brand.id },
            data: { image: wordmark(brand.name) },
        });
    }

    for (const shop of await prisma.shop.findMany()) {
        await prisma.shop.update({
            where: { id: shop.id },
            data: { logoUrl: wordmark(shop.name) },
        });
    }

    console.log(
        `Updated ${products} products, ${categories} categories, ` +
            `${(await prisma.brand.count())} brands and ${(await prisma.shop.count())} shops.`
    );
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
