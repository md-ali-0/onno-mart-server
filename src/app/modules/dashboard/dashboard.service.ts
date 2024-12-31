import { Prisma } from "@prisma/client";
import prisma from "../../../shared/prisma";

const getDashboardStatistics = async () => {
    // Total Counts
    const totalProducts = await prisma.product.count({
        where: { isDeleted: false },
    });
    const totalOrders = await prisma.order.count({
        where: { isDeleted: false },
    });
    const totalShops = await prisma.shop.count({});
    const totalReviews = await prisma.review.count({
        where: { isDeleted: false },
    });

    // Chart Data
    // 1. Orders by Status (Pie Chart)
    const ordersByStatus = await prisma.order.groupBy({
        by: ["status"],
        _count: {
            status: true,
        },
    });
    const pieChartData = ordersByStatus.map((statusData) => ({
        name: statusData.status,
        value: statusData._count.status,
    }));

    // 2. Sales by Month (Bar Chart) using Raw SQL
    const salesByMonth = await prisma.$queryRaw<
        { month: string; totalSales: number }[]
    >(
        Prisma.sql`
        SELECT
            TO_CHAR("createdAt", 'Mon YYYY') AS month,
            SUM("totalAmount") AS "totalSales"
        FROM "Order"
        WHERE "isDeleted" = false
        GROUP BY TO_CHAR("createdAt", 'Mon YYYY')
        ORDER BY TO_DATE(TO_CHAR("createdAt", 'Mon YYYY'), 'Mon YYYY');
    `
    );

    const barChartData = salesByMonth.map((monthData) => ({
        month: monthData.month,
        totalSales: monthData.totalSales,
    }));

    return {
        statistics: {
            totalProducts,
            totalOrders,
            totalShops,
            totalReviews,
        },
        charts: {
            pieChartData,
            barChartData,
        },
    };
};

export const DashboardService = {
    getDashboardStatistics,
};
