export const slugify = (value: string): string => {
    const base = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60);

    return base || "shop";
};

/**
 * Shop names are not unique, so append -2, -3 ... until the slug is free.
 * Runs inside the caller's transaction client.
 */
export const uniqueShopSlug = async (
    tx: { shop: { findFirst: (args: unknown) => Promise<unknown> } },
    name: string
): Promise<string> => {
    const base = slugify(name);

    for (let attempt = 0; attempt < 50; attempt += 1) {
        const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
        const taken = await tx.shop.findFirst({
            where: { slug: candidate },
            select: { id: true },
        });
        if (!taken) return candidate;
    }

    return `${base}-${Date.now().toString(36)}`;
};
