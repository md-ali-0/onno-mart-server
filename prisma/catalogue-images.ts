/**
 * Curated demo catalogue imagery. The original seed used picsum.photos,
 * which put landscapes on phones and city skylines on rice cookers.
 * Every Unsplash photo id below was checked to return a real image;
 * brand and shop tiles are generated monograms so they never 404.
 */

const photo = (id: string, crop = "entropy", size = 900) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${size}&h=${size}&q=80&crop=${crop}`;

export const PRODUCT_PHOTOS: Record<string, string> = {
    'rupchanda-soybean-oil-5l': '1474979266404-7eaacbcd87c5',
    'fresh-chinigura-rice-5kg': '1586201375761-83865001e31c',
    'fitlife-cycling-helmet': '1599058917212-d750089bc07e',
    'fitlife-dumbbell-set-20kg': '1517836357463-d25dfeac3438',
    'fitlife-yoga-mat-6mm': '1544367567-0f2fcb009e0b',
    'nivea-sun-protect-spf50': '1556228578-0d85b1a4d571',
    'nivea-face-wash-150ml': '1571781926291-c477ebfd024b',
    'nivea-body-lotion-400ml': '1608248543803-ba4f8c70ae0b',
    'ceramic-dinner-set-24-pieces': '1495474472287-4d71bcdd2085',
    'smart-led-table-lamp': '1507473885765-e6ed057f782c',
    'walton-ceiling-fan-56-inch': '1513506003901-1e6a229e2d15',
    'walton-rice-cooker-1-8l': '1574269909862-7e1d70bb8078',
    'sailor-cotton-kurti': '1584305574647-0cc949a2bb9f',
    'apex-formal-shirt': '1598032895397-b9472444bf93',
    'sailor-denim-jacket': '1596755094514-f87e34085b2c',
    'apex-casual-sneakers': '1600185365483-26d7a4cc7519',
    'sailor-mens-polo-shirt': '1521572163474-6864f9cf17ab',
    'apex-mens-leather-loafer': '1549298916-b41d501d3772',
    'xiaomi-power-bank-20000mah': '1610792516307-ea5acd9c3b00',
    'samsung-43-inch-smart-led-tv': '1593359677879-a4bb92f829d1',
    'walton-blender-500w': '1585515320310-259814833e62',
    'apple-iphone-15-128gb': '1580910051074-3eb694886505',
    'xiaomi-redmi-note-13-pro-8-256gb': '1512499617640-c74ae3a79d37',
    'samsung-galaxy-a55-5g-8-256gb': '1610945265064-0e34e5519bbf',
};

export const CATEGORY_PHOTOS: Record<string, string> = {
    'grocery': '1586201375761-83865001e31c',
    'sports-outdoors': '1599058917212-d750089bc07e',
    'beauty-care': '1596462502278-27bfdc403348',
    'home-living': '1507473885765-e6ed057f782c',
    'fashion': '1512436991641-6745cdb1723f',
    'electronics': '1610945265064-0e34e5519bbf',
};

const FALLBACK_PRODUCT = PRODUCT_PHOTOS["apple-iphone-15-128gb"];
const FALLBACK_CATEGORY = CATEGORY_PHOTOS.electronics;
const CROPS = ["entropy", "top", "bottom", "left"];

export function productImage(slug: string, variant = 0): string {
    return photo(PRODUCT_PHOTOS[slug] ?? FALLBACK_PRODUCT, CROPS[variant % CROPS.length]);
}

export function categoryImage(slug: string): string {
    return photo(CATEGORY_PHOTOS[slug] ?? FALLBACK_CATEGORY, "entropy", 600);
}

/** A clean single-letter tile instead of a random photo for a logo. */
export function wordmark(name: string): string {
    const letter = (name.trim()[0] ?? "?").toUpperCase();
    return `https://placehold.co/400x400/f4f4f5/ea580c/png?text=${encodeURIComponent(letter)}`;
}
