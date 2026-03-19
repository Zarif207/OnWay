const express = require("express");

module.exports = (collections) => {
    const router = express.Router();

    // GET /api/dashboard/stats - Get comprehensive dashboard statistics
    router.get("/stats", async (req, res) => {
        try {
            const {
                passengerCollection,
                ridersCollection,
                bookingsCollection,
                paymentsCollection,
                reviewsCollection,
                emergencyCollection
            } = collections;

            // Get current date ranges
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

            // Parallel queries for better performance
            const [
                totalUsers,
                totalDrivers,
                totalBookings,
                todayBookings,
                weekBookings,
                monthBookings,
                lastMonthBookings,
                completedBookings,
                ongoingBookings,
                pendingBookings,
                cancelledBookings,
                totalRevenue,
                todayRevenue,
                weekRevenue,
                monthRevenue,
                avgRating,
                totalReviews,
                emergencyCount,
                todayEmergency,
                recentBookings,
                topDrivers,
                recentUsers
            ] = await Promise.all([
                // User stats
                passengerCollection.countDocuments(),
                ridersCollection.countDocuments(),

                // Booking stats
                bookingsCollection.countDocuments(),
                bookingsCollection.countDocuments({ createdAt: { $gte: todayStart } }),
                bookingsCollection.countDocuments({ createdAt: { $gte: weekStart } }),
                bookingsCollection.countDocuments({ createdAt: { $gte: monthStart } }),
                bookingsCollection.countDocuments({
                    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd }
                }),

                // Booking status
                bookingsCollection.countDocuments({ bookingStatus: "completed" }),
                bookingsCollection.countDocuments({ bookingStatus: "ongoing" }),
                bookingsCollection.countDocuments({ bookingStatus: "pending" }),
                bookingsCollection.countDocuments({ bookingStatus: "cancelled" }),

                // Revenue stats
                bookingsCollection.aggregate([
                    { $match: { bookingStatus: "completed" } },
                    { $group: { _id: null, total: { $sum: "$price" } } }
                ]).toArray(),
                bookingsCollection.aggregate([
                    {
                        $match: {
                            bookingStatus: "completed",
                            createdAt: { $gte: todayStart }
                        }
                    },
                    { $group: { _id: null, total: { $sum: "$price" } } }
                ]).toArray(),
                bookingsCollection.aggregate([
                    {
                        $match: {
                            bookingStatus: "completed",
                            createdAt: { $gte: weekStart }
                        }
                    },
                    { $group: { _id: null, total: { $sum: "$price" } } }
                ]).toArray(),
                bookingsCollection.aggregate([
                    {
                        $match: {
                            bookingStatus: "completed",
                            createdAt: { $gte: monthStart }
                        }
                    },
                    { $group: { _id: null, total: { $sum: "$price" } } }
                ]).toArray(),

                // Review stats
                reviewsCollection.aggregate([
                    { $group: { _id: null, avgRating: { $avg: "$rating" } } }
                ]).toArray(),
                reviewsCollection.countDocuments(),

                // Emergency stats
                emergencyCollection.countDocuments(),
                emergencyCollection.countDocuments({ createdAt: { $gte: todayStart } }),

                // Recent data
                bookingsCollection.find().sort({ createdAt: -1 }).limit(10).toArray(),
                ridersCollection.find().sort({ totalRides: -1 }).limit(5).toArray(),
                passengerCollection.find().sort({ createdAt: -1 }).limit(5).toArray()
            ]);

            // Calculate growth percentages
            const userGrowth = lastMonthBookings > 0
                ? ((monthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
                : 0;

            // Get hourly distribution for today
            const hourlyBookings = await bookingsCollection.aggregate([
                { $match: { createdAt: { $gte: todayStart } } },
                {
                    $group: {
                        _id: { $hour: "$createdAt" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]).toArray();

            // Get daily bookings for the week
            const dailyBookings = await bookingsCollection.aggregate([
                { $match: { createdAt: { $gte: weekStart } } },
                {
                    $group: {
                        _id: { $dayOfWeek: "$createdAt" },
                        count: { $sum: 1 },
                        revenue: { $sum: "$price" }
                    }
                },
                { $sort: { _id: 1 } }
            ]).toArray();

            // Get monthly revenue trend (last 6 months)
            const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
            const monthlyRevenue = await bookingsCollection.aggregate([
                {
                    $match: {
                        createdAt: { $gte: sixMonthsAgo },
                        bookingStatus: "completed"
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        revenue: { $sum: "$price" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]).toArray();

            // Response
            res.json({
                success: true,
                data: {
                    overview: {
                        totalUsers,
                        totalDrivers,
                        totalBookings,
                        totalRevenue: totalRevenue[0]?.total || 0,
                        avgRating: avgRating[0]?.avgRating || 0,
                        totalReviews,
                        emergencyCount,
                        completedBookings,
                        ongoingBookings,
                        pendingBookings,
                        cancelledBookings
                    },
                    today: {
                        bookings: todayBookings,
                        revenue: todayRevenue[0]?.total || 0,
                        emergency: todayEmergency
                    },
                    week: {
                        bookings: weekBookings,
                        revenue: weekRevenue[0]?.total || 0
                    },
                    month: {
                        bookings: monthBookings,
                        revenue: monthRevenue[0]?.total || 0
                    },
                    growth: {
                        userGrowth: parseFloat(userGrowth),
                        bookingGrowth: lastMonthBookings > 0
                            ? ((monthBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1)
                            : 0
                    },
                    charts: {
                        hourlyBookings: hourlyBookings.map(h => ({
                            hour: `${h._id}:00`,
                            count: h.count
                        })),
                        dailyBookings: dailyBookings.map(d => ({
                            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d._id - 1],
                            count: d.count,
                            revenue: d.revenue
                        })),
                        monthlyRevenue: monthlyRevenue.map(m => ({
                            month: `${m._id.year}-${String(m._id.month).padStart(2, '0')}`,
                            revenue: m.revenue,
                            count: m.count
                        })),
                        statusDistribution: [
                            { name: 'Completed', value: completedBookings, color: '#22c55e' },
                            { name: 'Ongoing', value: ongoingBookings, color: '#3b82f6' },
                            { name: 'Pending', value: pendingBookings, color: '#f59e0b' },
                            { name: 'Cancelled', value: cancelledBookings, color: '#ef4444' }
                        ]
                    },
                    recent: {
                        bookings: recentBookings,
                        drivers: topDrivers,
                        users: recentUsers
                    }
                }
            });
        } catch (error) {
            console.error("Dashboard stats error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch dashboard statistics",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};
