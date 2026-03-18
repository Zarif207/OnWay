const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (collections) => {
  const router = express.Router();

  /**
   * Global Smart Search API
   * Searches across multiple collections with partial, case-insensitive matching
   * GET /api/search?q=keyword&limit=5
   */
  router.get("/", async (req, res) => {
    try {
      const { q, limit = 5 } = req.query;

      // Validation
      if (!q || q.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const searchQuery = q.trim();
      const resultLimit = parseInt(limit);

      // Create case-insensitive regex pattern
      const searchRegex = new RegExp(searchQuery, "i");

      // Parallel search across all collections
      const [users, riders, bookings, reviews] = await Promise.all([
        // Search Users (passenger collection)
        collections.passengerCollection
          .find({
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { phone: searchRegex },
            ],
          })
          .limit(resultLimit)
          .project({ _id: 1, name: 1, email: 1, phone: 1, role: 1, image: 1 })
          .toArray(),

        // Search Riders
        collections.ridersCollection
          .find({
            $or: [
              { name: searchRegex },
              { email: searchRegex },
              { phone: searchRegex },
              { licenseNumber: searchRegex },
            ],
          })
          .limit(resultLimit)
          .project({
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            isApproved: 1,
            isOnline: 1,
            image: 1,
          })
          .toArray(),

        // Search Bookings
        collections.bookingsCollection
          .find({
            $or: [
              { "pickupLocation.address": searchRegex },
              { "dropoffLocation.address": searchRegex },
              { bookingStatus: searchRegex },
              { passengerId: searchRegex },
            ],
          })
          .limit(resultLimit)
          .project({
            _id: 1,
            pickupLocation: 1,
            dropoffLocation: 1,
            bookingStatus: 1,
            price: 1,
            distance: 1,
            createdAt: 1,
          })
          .toArray(),

        // Search Reviews
        collections.reviewsCollection
          .find({
            $or: [
              { userName: searchRegex },
              { review: searchRegex },
              { driverName: searchRegex },
            ],
          })
          .limit(resultLimit)
          .project({
            _id: 1,
            userName: 1,
            driverName: 1,
            review: 1,
            rating: 1,
            createdAt: 1,
          })
          .toArray(),
      ]);

      // Format results with category and metadata
      const results = {
        users: users.map((user) => ({
          id: user._id.toString(),
          type: "user",
          category: "Users",
          title: user.name,
          subtitle: user.email,
          metadata: {
            phone: user.phone,
            role: user.role,
            image: user.image,
          },
          route: `/dashboard/admin/user-management?id=${user._id}`,
        })),

        riders: riders.map((rider) => ({
          id: rider._id.toString(),
          type: "rider",
          category: "Riders",
          title: rider.name,
          subtitle: rider.email,
          metadata: {
            phone: rider.phone,
            isApproved: rider.isApproved,
            isOnline: rider.isOnline,
            image: rider.image,
          },
          route: `/dashboard/admin/driver-management?id=${rider._id}`,
        })),

        bookings: bookings.map((booking) => ({
          id: booking._id.toString(),
          type: "booking",
          category: "Bookings",
          title: `${booking.pickupLocation?.address || "Unknown"} → ${booking.dropoffLocation?.address || "Unknown"
            }`,
          subtitle: `${booking.bookingStatus} • ₹${booking.price || 0}`,
          metadata: {
            distance: booking.distance,
            status: booking.bookingStatus,
            createdAt: booking.createdAt,
          },
          route: `/dashboard/admin/ride-management?id=${booking._id}`,
        })),

        reviews: reviews.map((review) => ({
          id: review._id.toString(),
          type: "review",
          category: "Reviews",
          title: review.userName || "Anonymous",
          subtitle: `${review.rating}⭐ - ${review.review?.substring(0, 50) || ""
            }...`,
          metadata: {
            driverName: review.driverName,
            rating: review.rating,
            createdAt: review.createdAt,
          },
          route: `/dashboard/admin/reviews?id=${review._id}`,
        })),
      };

      // Calculate total results
      const totalResults =
        results.users.length +
        results.riders.length +
        results.bookings.length +
        results.reviews.length;

      res.json({
        success: true,
        query: searchQuery,
        totalResults,
        results,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        success: false,
        message: "Search failed",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  /**
   * Search by ID (for direct lookups)
   * GET /api/search/by-id?id=xxx&type=user
   */
  router.get("/by-id", async (req, res) => {
    try {
      const { id, type } = req.query;

      if (!id || !type) {
        return res.status(400).json({
          success: false,
          message: "ID and type are required",
        });
      }

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format",
        });
      }

      let result = null;
      let collection = null;

      // Determine collection based on type
      switch (type) {
        case "user":
          collection = collections.passengerCollection;
          break;
        case "rider":
          collection = collections.ridersCollection;
          break;
        case "booking":
          collection = collections.bookingsCollection;
          break;
        case "review":
          collection = collections.reviewsCollection;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid type",
          });
      }

      result = await collection.findOne({ _id: new ObjectId(id) });

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Item not found",
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Search by ID error:", error);
      res.status(500).json({
        success: false,
        message: "Search failed",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  });

  return router;
};
