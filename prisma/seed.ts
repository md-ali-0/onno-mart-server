import {
    CouponType,
    OrderStatus,
    PrismaClient,
    Role,
    ShopStatus,
    UserStatus,
} from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const image = (seed: string) => `https://picsum.photos/seed/${seed}/900/900`;
const DEMO_PASSWORD = 'OnnoMart@123';

const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Home & Living', slug: 'home-living' },
    { name: 'Beauty & Care', slug: 'beauty-care' },
    { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
    { name: 'Grocery', slug: 'grocery' },
];

const brands = [
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Xiaomi', slug: 'xiaomi' },
    { name: 'Apple', slug: 'apple' },
    { name: 'Apex', slug: 'apex' },
    { name: 'Sailor', slug: 'sailor' },
    { name: 'Walton', slug: 'walton' },
    { name: 'Nivea', slug: 'nivea' },
    { name: 'Fitlife', slug: 'fitlife' },
    { name: 'Fresh', slug: 'fresh' },
    { name: 'Rupchanda', slug: 'rupchanda' },
];

type SeedProduct = {
    name: string;
    slug: string;
    price: number;
    discount: number;
    inventory: number;
    categorySlug: string;
    brandSlug: string;
    shopKey: 'gadget' | 'fashion' | 'living';
    description: string;
};

const products: SeedProduct[] = [
    {
        name: 'Samsung Galaxy A55 5G (8/256GB)',
        slug: 'samsung-galaxy-a55-5g-8-256gb',
        price: 42999,
        discount: 8,
        inventory: 24,
        categorySlug: 'electronics',
        brandSlug: 'samsung',
        shopKey: 'gadget',
        description:
            'Super AMOLED display, 50MP OIS camera and a 5000mAh battery with 25W fast charging. Official warranty included.',
    },
    {
        name: 'Xiaomi Redmi Note 13 Pro (8/256GB)',
        slug: 'xiaomi-redmi-note-13-pro-8-256gb',
        price: 32999,
        discount: 5,
        inventory: 31,
        categorySlug: 'electronics',
        brandSlug: 'xiaomi',
        shopKey: 'gadget',
        description:
            '200MP camera, 120Hz AMOLED panel and 67W turbo charging — a mid-range phone that punches well above its price.',
    },
    {
        name: 'Apple iPhone 15 128GB',
        slug: 'apple-iphone-15-128gb',
        price: 124999,
        discount: 0,
        inventory: 9,
        categorySlug: 'electronics',
        brandSlug: 'apple',
        shopKey: 'gadget',
        description:
            'A16 Bionic chip, Dynamic Island and USB-C. Sealed box with official Bangladesh warranty.',
    },
    {
        name: 'Walton Blender 500W',
        slug: 'walton-blender-500w',
        price: 3450,
        discount: 10,
        inventory: 42,
        categorySlug: 'electronics',
        brandSlug: 'walton',
        shopKey: 'gadget',
        description:
            'Two-speed 500W motor with stainless steel blades and a 1.5L unbreakable jar. Built for daily kitchen use.',
    },
    {
        name: 'Samsung 43 inch Smart LED TV',
        slug: 'samsung-43-inch-smart-led-tv',
        price: 38900,
        discount: 12,
        inventory: 15,
        categorySlug: 'electronics',
        brandSlug: 'samsung',
        shopKey: 'gadget',
        description:
            'Full HD smart TV with built-in WiFi, YouTube and Netflix apps, plus two HDMI and USB ports.',
    },
    {
        name: 'Xiaomi Power Bank 20000mAh',
        slug: 'xiaomi-power-bank-20000mah',
        price: 2490,
        discount: 0,
        inventory: 60,
        categorySlug: 'electronics',
        brandSlug: 'xiaomi',
        shopKey: 'gadget',
        description:
            'Dual-port 22.5W fast charging power bank that refills a phone up to four times on a single charge.',
    },
    {
        name: "Apex Men's Leather Loafer",
        slug: 'apex-mens-leather-loafer',
        price: 2890,
        discount: 15,
        inventory: 38,
        categorySlug: 'fashion',
        brandSlug: 'apex',
        shopKey: 'fashion',
        description:
            'Genuine leather upper with a cushioned insole. Sizes 39 to 44, suitable for office and formal wear.',
    },
    {
        name: "Sailor Men's Polo Shirt",
        slug: 'sailor-mens-polo-shirt',
        price: 1290,
        discount: 20,
        inventory: 74,
        categorySlug: 'fashion',
        brandSlug: 'sailor',
        shopKey: 'fashion',
        description:
            'Soft cotton pique polo that holds its shape after washing. Available in five colours.',
    },
    {
        name: 'Apex Casual Sneakers',
        slug: 'apex-casual-sneakers',
        price: 3200,
        discount: 10,
        inventory: 29,
        categorySlug: 'fashion',
        brandSlug: 'apex',
        shopKey: 'fashion',
        description:
            'Breathable mesh upper with a lightweight EVA sole — comfortable enough for all-day walking.',
    },
    {
        name: 'Sailor Denim Jacket',
        slug: 'sailor-denim-jacket',
        price: 3450,
        discount: 5,
        inventory: 21,
        categorySlug: 'fashion',
        brandSlug: 'sailor',
        shopKey: 'fashion',
        description:
            'Mid-wash denim jacket with metal buttons and two chest pockets. Unisex fit, S to XXL.',
    },
    {
        name: 'Apex Formal Shirt',
        slug: 'apex-formal-shirt',
        price: 1890,
        discount: 0,
        inventory: 45,
        categorySlug: 'fashion',
        brandSlug: 'apex',
        shopKey: 'fashion',
        description:
            'Wrinkle-resistant cotton blend shirt with a slim collar. Ideal for office wear.',
    },
    {
        name: 'Sailor Cotton Kurti',
        slug: 'sailor-cotton-kurti',
        price: 1650,
        discount: 12,
        inventory: 52,
        categorySlug: 'fashion',
        brandSlug: 'sailor',
        shopKey: 'fashion',
        description:
            'Hand-block printed cotton kurti with side slits. Colourfast dye, machine washable.',
    },
    {
        name: 'Walton Rice Cooker 1.8L',
        slug: 'walton-rice-cooker-1-8l',
        price: 3990,
        discount: 8,
        inventory: 26,
        categorySlug: 'home-living',
        brandSlug: 'walton',
        shopKey: 'living',
        description:
            'Non-stick inner pot with keep-warm function and a spare measuring cup. Cooks rice for four to five people.',
    },
    {
        name: 'Walton Ceiling Fan 56 inch',
        slug: 'walton-ceiling-fan-56-inch',
        price: 4290,
        discount: 0,
        inventory: 18,
        categorySlug: 'home-living',
        brandSlug: 'walton',
        shopKey: 'living',
        description:
            'Copper-wound motor with double ball bearings, running quietly at low power consumption.',
    },
    {
        name: 'Smart LED Table Lamp',
        slug: 'smart-led-table-lamp',
        price: 1450,
        discount: 10,
        inventory: 40,
        categorySlug: 'home-living',
        brandSlug: 'walton',
        shopKey: 'living',
        description:
            'Touch-controlled LED lamp with three colour temperatures and a USB charging port in the base.',
    },
    {
        name: 'Ceramic Dinner Set 24 Pieces',
        slug: 'ceramic-dinner-set-24-pieces',
        price: 2790,
        discount: 5,
        inventory: 22,
        categorySlug: 'home-living',
        brandSlug: 'walton',
        shopKey: 'living',
        description:
            'Microwave-safe ceramic set for six people, with a glazed finish that resists scratching.',
    },
    {
        name: 'Nivea Body Lotion 400ml',
        slug: 'nivea-body-lotion-400ml',
        price: 690,
        discount: 5,
        inventory: 88,
        categorySlug: 'beauty-care',
        brandSlug: 'nivea',
        shopKey: 'living',
        description:
            'Deep moisture serum with almond oil, absorbed quickly and suitable for daily use on dry skin.',
    },
    {
        name: 'Nivea Face Wash 150ml',
        slug: 'nivea-face-wash-150ml',
        price: 420,
        discount: 0,
        inventory: 96,
        categorySlug: 'beauty-care',
        brandSlug: 'nivea',
        shopKey: 'living',
        description:
            'Gentle daily cleanser that removes oil without stripping moisture. Dermatologically tested.',
    },
    {
        name: 'Nivea Sun Protect SPF50',
        slug: 'nivea-sun-protect-spf50',
        price: 850,
        discount: 10,
        inventory: 64,
        categorySlug: 'beauty-care',
        brandSlug: 'nivea',
        shopKey: 'living',
        description:
            'Broad-spectrum sunscreen lotion for face and body, water resistant and non-greasy.',
    },
    {
        name: 'Fitlife Yoga Mat 6mm',
        slug: 'fitlife-yoga-mat-6mm',
        price: 1250,
        discount: 10,
        inventory: 35,
        categorySlug: 'sports-outdoors',
        brandSlug: 'fitlife',
        shopKey: 'living',
        description:
            'Anti-slip TPE mat with alignment lines and a carry strap. Easy to wipe clean after a session.',
    },
    {
        name: 'Fitlife Dumbbell Set 20kg',
        slug: 'fitlife-dumbbell-set-20kg',
        price: 5600,
        discount: 8,
        inventory: 14,
        categorySlug: 'sports-outdoors',
        brandSlug: 'fitlife',
        shopKey: 'living',
        description:
            'Adjustable chrome rods with rubber-coated plates, so plates can be swapped without scratching the floor.',
    },
    {
        name: 'Fitlife Cycling Helmet',
        slug: 'fitlife-cycling-helmet',
        price: 2200,
        discount: 5,
        inventory: 27,
        categorySlug: 'sports-outdoors',
        brandSlug: 'fitlife',
        shopKey: 'living',
        description:
            'In-mould helmet with thirteen vents and a dial fit system adjustable from 54 to 61cm.',
    },
    {
        name: 'Fresh Chinigura Rice 5kg',
        slug: 'fresh-chinigura-rice-5kg',
        price: 780,
        discount: 0,
        inventory: 120,
        categorySlug: 'grocery',
        brandSlug: 'fresh',
        shopKey: 'living',
        description:
            'Aromatic Chinigura rice, double polished and stone free. Packed in a resealable bag.',
    },
    {
        name: 'Rupchanda Soybean Oil 5L',
        slug: 'rupchanda-soybean-oil-5l',
        price: 920,
        discount: 3,
        inventory: 110,
        categorySlug: 'grocery',
        brandSlug: 'rupchanda',
        shopKey: 'living',
        description:
            'Fortified soybean cooking oil with vitamin A and D, in a food-grade five litre jar.',
    },
];

const vendors = [
    {
        key: 'gadget' as const,
        email: 'gadget@onnomart.dev',
        name: 'Dhaka Gadget House',
        shopName: 'Dhaka Gadget House',
        description:
            'Phones, appliances and accessories with official warranty. Ships within 24 hours inside Dhaka.',
    },
    {
        key: 'fashion' as const,
        email: 'fashion@onnomart.dev',
        name: 'Rongdhonu Fashion',
        shopName: 'Rongdhonu Fashion',
        description:
            'Everyday clothing and footwear from brands such as Apex and Sailor, sized for the local market.',
    },
    {
        key: 'living' as const,
        email: 'living@onnomart.dev',
        name: 'Shobuj Bazar',
        shopName: 'Shobuj Bazar',
        description:
            'Home, kitchen, personal care and grocery essentials, delivered together in one order.',
    },
];

async function reset() {
    await prisma.reviewReply.deleteMany();
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.image.deleteMany();
    await prisma.product.deleteMany();
    await prisma.shop.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.newsletter.deleteMany();
    await prisma.user.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();
}

async function main() {
    await reset();

    const password = await bcrypt.hash(DEMO_PASSWORD, 10);

    await prisma.user.create({
        data: {
            email: 'admin@onnomart.dev',
            password,
            name: 'OnnoMart Admin',
            role: Role.ADMIN,
            status: UserStatus.ACTIVE,
            phone: '+8801700000001',
            city: 'Dhaka',
            state: 'Dhaka',
            zip_code: '1207',
            address: 'Level 4, Rupayan Trade Centre, Banglamotor',
            country: 'Bangladesh',
        },
    });

    const customer = await prisma.user.create({
        data: {
            email: 'customer@onnomart.dev',
            password,
            name: 'Nusrat Jahan',
            role: Role.USER,
            status: UserStatus.ACTIVE,
            phone: '+8801700000002',
            city: 'Dhaka',
            state: 'Dhaka',
            zip_code: '1212',
            address: 'House 18, Road 7, Dhanmondi',
            country: 'Bangladesh',
        },
    });

    const shopByKey: Record<string, string> = {};
    const vendorUserByKey: Record<string, string> = {};

    for (const vendor of vendors) {
        const vendorUser = await prisma.user.create({
            data: {
                email: vendor.email,
                password,
                name: vendor.name,
                role: Role.VENDOR,
                status: UserStatus.ACTIVE,
                city: 'Dhaka',
                country: 'Bangladesh',
            },
        });

        const shop = await prisma.shop.create({
            data: {
                name: vendor.shopName,
                logoUrl: image(`shop-${vendor.key}`),
                description: vendor.description,
                status: ShopStatus.ACTIVE,
                vendor: {
                    create: {
                        userId: vendorUser.id,
                    },
                },
            },
        });

        shopByKey[vendor.key] = shop.id;
        vendorUserByKey[vendor.key] = vendorUser.id;
    }

    const categoryBySlug: Record<string, string> = {};
    for (const category of categories) {
        const created = await prisma.category.create({
            data: { ...category, image: image(`cat-${category.slug}`) },
        });
        categoryBySlug[category.slug] = created.slug;
    }

    const brandBySlug: Record<string, string> = {};
    for (const brand of brands) {
        const created = await prisma.brand.create({
            data: { ...brand, image: image(`brand-${brand.slug}`) },
        });
        brandBySlug[brand.slug] = created.slug;
    }

    const productBySlug: Record<string, { id: string; shopId: string; price: number }> = {};

    for (const product of products) {
        const shopId = shopByKey[product.shopKey];

        const created = await prisma.product.create({
            data: {
                name: product.name,
                slug: product.slug,
                price: product.price,
                discount: product.discount,
                inventory: product.inventory,
                description: product.description,
                thumbnail: image(product.slug),
                categoryId: categoryBySlug[product.categorySlug],
                brandId: brandBySlug[product.brandSlug],
                shopId,
                images: {
                    create: [
                        { url: image(`${product.slug}-1`) },
                        { url: image(`${product.slug}-2`) },
                        { url: image(`${product.slug}-3`) },
                    ],
                },
            },
        });

        productBySlug[product.slug] = {
            id: created.id,
            shopId,
            price: created.price,
        };
    }

    const reviews = [
        { slug: 'samsung-galaxy-a55-5g-8-256gb', rating: 5, comment: 'Delivery was next day and the phone is sealed. Very happy with the camera.' },
        { slug: 'xiaomi-redmi-note-13-pro-8-256gb', rating: 4, comment: 'Great value for the price. Charging speed is exactly as advertised.' },
        { slug: 'apex-mens-leather-loafer', rating: 5, comment: 'Leather feels genuine and the size matched the chart perfectly.' },
        { slug: 'walton-rice-cooker-1-8l', rating: 4, comment: 'Cooks rice for five people easily. The keep-warm function is handy.' },
        { slug: 'nivea-body-lotion-400ml', rating: 5, comment: 'Original product, sealed bottle. Absorbs quickly without feeling oily.' },
    ];

    for (const review of reviews) {
        const product = productBySlug[review.slug];

        const created = await prisma.review.create({
            data: {
                userId: customer.id,
                productId: product.id,
                shopId: product.shopId,
                rating: review.rating,
                comment: review.comment,
            },
        });

        const shopVendorUserId = Object.entries(shopByKey).find(
            ([, id]) => id === product.shopId
        );

        if (shopVendorUserId) {
            await prisma.reviewReply.create({
                data: {
                    reviewId: created.id,
                    userId: vendorUserByKey[shopVendorUserId[0]],
                    comment: 'Thank you for the feedback — glad the order reached you on time.',
                },
            });
        }
    }

    const orderPlans = [
        {
            shopKey: 'gadget' as const,
            status: OrderStatus.COMPLETED,
            paymentMethod: 'SSLCommerz',
            items: [
                { slug: 'samsung-galaxy-a55-5g-8-256gb', quantity: 1 },
                { slug: 'xiaomi-power-bank-20000mah', quantity: 2 },
            ],
        },
        {
            shopKey: 'fashion' as const,
            status: OrderStatus.SHIPPED,
            paymentMethod: 'Cash on Delivery',
            items: [{ slug: 'sailor-mens-polo-shirt', quantity: 2 }],
        },
        {
            shopKey: 'living' as const,
            status: OrderStatus.PENDING,
            paymentMethod: 'Aamarpay',
            items: [
                { slug: 'walton-rice-cooker-1-8l', quantity: 1 },
                { slug: 'fresh-chinigura-rice-5kg', quantity: 2 },
            ],
        },
    ];

    for (const [index, plan] of orderPlans.entries()) {
        const items = plan.items.map((item) => {
            const product = productBySlug[item.slug];
            return {
                productId: product.id,
                quantity: item.quantity,
                price: product.price,
            };
        });

        const totalAmount = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        await prisma.order.create({
            data: {
                userId: customer.id,
                shopId: shopByKey[plan.shopKey],
                tranId: `TXN-SEED-${1001 + index}`,
                totalAmount,
                paymentMethod: plan.paymentMethod,
                status: plan.status,
                products: { create: items },
            },
        });
    }

    await prisma.coupon.createMany({
        data: [
            {
                code: 'WELCOME10',
                discount: 10,
                type: CouponType.PERCENTAGE,
                description: '10% off the first order, no minimum spend.',
                isActive: true,
            },
            {
                code: 'FLAT200',
                discount: 200,
                type: CouponType.FIXED_AMOUNT,
                description: 'Tk 200 off on orders above Tk 2000.',
                isActive: true,
            },
            {
                code: 'EID25',
                discount: 25,
                type: CouponType.PERCENTAGE,
                description: 'Seasonal 25% off campaign coupon.',
                isActive: true,
                startDate: new Date('2026-11-01T00:00:00.000Z'),
                endDate: new Date('2026-12-31T23:59:59.000Z'),
            },
        ],
    });

    await prisma.newsletter.createMany({
        data: [
            { email: 'tanvir.ahmed@example.com', firstName: 'Tanvir', lastName: 'Ahmed' },
            { email: 'sadia.rahman@example.com', firstName: 'Sadia', lastName: 'Rahman' },
            { email: 'mehedi.hasan@example.com', firstName: 'Mehedi', lastName: 'Hasan' },
            { email: 'farhana.islam@example.com', firstName: 'Farhana', lastName: 'Islam' },
        ],
    });

    console.log('Seed complete:');
    console.log(`  users        ${await prisma.user.count()}`);
    console.log(`  shops        ${await prisma.shop.count()}`);
    console.log(`  categories   ${await prisma.category.count()}`);
    console.log(`  brands       ${await prisma.brand.count()}`);
    console.log(`  products     ${await prisma.product.count()}`);
    console.log(`  orders       ${await prisma.order.count()}`);
    console.log(`  reviews      ${await prisma.review.count()}`);
    console.log(`  coupons      ${await prisma.coupon.count()}`);
    console.log('');
    console.log(`Demo password for every seeded account: ${DEMO_PASSWORD}`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
