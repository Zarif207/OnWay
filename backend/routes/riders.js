const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");

module.exports = function (collections) {
  const router = express.Router();
  const { ridersCollection, ridesCollection, reviewsCollection } = collections;

  // 🔹 Create Rider (Register)
  router.post("/", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        address,
        gender,
        dateOfBirth,
        identity,
        licenseNumber,
        vehicle,
        operationCities,
        image
      } = req.body;

      if (!firstName || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: "First name, email, and phone are required"
        });
      }

      const existing = await ridersCollection.findOne({ email });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Rider already exists with this email"
        });
      }

      const defaultPassword = "onway_rider_pass";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const rider = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone,
        password: hashedPassword,
        address: address || {},
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        identity: identity || {},
        licenseNumber: licenseNumber || null,
        vehicle: vehicle || {},
        operationCities: operationCities || [],
        image: image || null,
        role: "rider",
        isOnline: false,
        isApproved: false,
        createdAt: new Date(),
      };

      const result = await ridersCollection.insertOne(rider);

      res.status(201).json({
        success: true,
        message: "Rider registered successfully",
        data: {
          riderId: result.insertedId,
          email: rider.email,
          name: rider.name
        }
      });
    } catch (error) {
      console.error("Rider registration error:", error);
      res.status(500).json({
        success: false,
        message: "Rider registration failed"
      });
    }
  });

  // 🔹 Get Driver Dashboard Stats (Consolidated)
  router.get("/dashboard/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Driver ID" });
      }

      let driver = await ridersCollection.findOne({ _id: new ObjectId(id) });

      // If not found in riders collection, check passenger collection
      if (!driver) {
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(id) });
        if (passenger && (passenger.role === "rider" || passenger.role === "driver")) {
          // Found as passenger with rider role, now try to find detailed rider info by email
          const detailedRider = await ridersCollection.findOne({ email: passenger.email });
          driver = detailedRider || passenger; // Use detailed info if available, otherwise fallback to passenger
        }
      }

      if (!driver) {
        return res.status(404).json({ success: false, message: "Driver not found" });
      }

      // Fetch rides and reviews using both ID and email for robustness
      const query = { $or: [{ driverId: id }, { driverEmail: driver.email }] };
      const rides = await ridesCollection.find(query).toArray();
      const reviews = await reviewsCollection.find(query).toArray();

      const todayStr = new Date().toISOString().split("T")[0];
      let todayEarnings = 0;
      let totalEarnings = 0;
      let completedRides = 0;
      let ongoingRide = null;

      rides.forEach(ride => {
        const fare = parseFloat(ride.fare) || 0;
        if (ride.status === "completed") {
          completedRides++;
          totalEarnings += fare;
          if (ride.createdAt && new Date(ride.createdAt).toISOString().split("T")[0] === todayStr) {
            todayEarnings += fare;
          }
        }
        if (["ongoing", "pending", "accepted"].includes(ride.status)) {
          ongoingRide = ride;
        }
      });

      const avgRating = reviews.length > 0
        ? reviews.reduce((acc, rev) => acc + (rev.rating || 0), 0) / reviews.length
        : 5.0;

      res.json({
        success: true,
        data: {
          isOnline: driver.isOnline || false,
          todayEarnings: todayEarnings.toFixed(2),
          totalEarnings: totalEarnings.toFixed(2),
          totalRides: completedRides,
          avgRating: avgRating.toFixed(1),
          ratingCount: reviews.length,
          recentRides: rides.slice(-5).reverse(),
          ongoingRide
        }
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // 🔹 Toggle Status
  router.post("/status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      const result = await ridersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isOnline, updatedAt: new Date() } }
      );

      // If no document was updated in riders, try passenger collection
      if (result.matchedCount === 0) {
        await collections.passengerCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { isOnline, updatedAt: new Date() } }
        );
      }

      res.json({ success: true, isOnline });
    } catch (error) {
      res.status(500).json({ success: false, message: "Update failed" });
    }
  });

  // 🔹 Get All Riders
  router.get("/", async (req, res) => {
    try {
      const riders = await ridersCollection.find().toArray();
      res.json({ success: true, data: riders });
    } catch (error) {
      res.status(500).json({ success: false, message: "Fetch failed" });
    }
  });


  // 🔹 Get Earnings Analytics
  router.get("/earnings", async (req, res) => {
    try {
      const { period, driverId } = req.query;
      if (!driverId || !ObjectId.isValid(driverId)) {
        return res.status(400).json({ success: false, message: "Invalid Driver ID" });
      }

      const rider = await ridersCollection.findOne({ _id: new ObjectId(driverId) });
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

      // In a real app, you'd aggregate this from rides or a separate earnings table
      // Here we assume earningsHistory is stored on the rider doc or we compute it
      let earnings = rider.earningsHistory || [];

      // Filter by period if needed (simple mock logic for demonstration)
      // Usually you'd aggregate by date: daily, weekly, monthly

      const totalCommission = earnings.reduce((sum, e) => sum + (e.commission || 0), 0);
      const totalBonus = earnings.reduce((sum, e) => sum + (e.bonus || 0), 0);

      res.json({
        success: true,
        data: {
          earnings,
          totalCommission,
          totalBonus
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Earnings fetch failed" });
    }
  });

  // 🔹 Get Balance
  router.get("/balance", async (req, res) => {
    try {
      const { driverId } = req.query;
      if (!driverId || !ObjectId.isValid(driverId)) {
        return res.status(400).json({ success: false, message: "Invalid Driver ID" });
      }

      const rider = await ridersCollection.findOne({ _id: new ObjectId(driverId) });
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

      res.json({
        success: true,
        data: {
          availableBalance: rider.availableBalance || 0,
          pendingWithdrawals: rider.pendingWithdrawals || 0,
          totalWithdrawn: rider.totalWithdrawn || 0
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Balance fetch failed" });
    }
  });

  // 🔹 Get Paginated Rides History
  router.get("/rides", async (req, res) => {
    try {
      const { status, driverId, page = 1, limit = 20, startDate, endDate } = req.query;

      if (!driverId) {
        return res.status(400).json({ success: false, message: "Driver ID is required" });
      }

      let match = { driverId };

      if (status) {
        match.status = status;
      } else {
        match.status = { $in: ["ongoing", "completed", "cancelled"] };
      }

      if (startDate && endDate) {
        match.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitVal = parseInt(limit);

      const rides = await ridesCollection
        .find(match)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitVal)
        .toArray();

      const total = await ridesCollection.countDocuments(match);

      res.json({
        success: true,
        data: {
          rides,
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limitVal),
          totalRides: total
        }
      });
    } catch (error) {
      console.error("Rides fetch error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch ride history" });
    }
  });

  // 🔹 Search Rides by Passenger Name
  router.get("/rides/search", async (req, res) => {
    try {
      const { q, driverId } = req.query;

      if (!driverId) {
        return res.status(400).json({ success: false, message: "Driver ID is required" });
      }

      const query = {
        driverId,
        passengerName: { $regex: q, $options: "i" }
      };

      const rides = await ridesCollection
        .find(query)
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      res.json({
        success: true,
        data: rides
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ success: false, message: "Search failed" });
    }
  });

  // 🔹 Get Withdrawal History
  router.get("/withdrawals", async (req, res) => {
    try {
      const { driverId, page = 1, limit = 10 } = req.query;
      if (!driverId || !ObjectId.isValid(driverId)) {
        return res.status(400).json({ success: false, message: "Invalid Driver ID" });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitVal = parseInt(limit);

      const withdrawals = await collections.withdrawalsCollection
        .find({ driverId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitVal)
        .toArray();

      const total = await collections.withdrawalsCollection.countDocuments({ driverId });

      res.json({
        success: true,
        data: {
          withdrawals,
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limitVal),
          totalWithdrawals: total
        }
      });
    } catch (error) {
      console.error("Fetch withdrawals error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch withdrawal history" });
    }
  });

  // 🔹 Request Withdrawal
  router.post("/withdraw", async (req, res) => {
    try {
      const { driverId, amount, method, accountDetails, notes } = req.body;

      if (!driverId || !amount || !method || !accountDetails) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      if (parseFloat(amount) <= 0) {
        return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
      }

      const rider = await ridersCollection.findOne({ _id: new ObjectId(driverId) });
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

      const available = parseFloat(rider.availableBalance) || 0;
      const requestAmount = parseFloat(amount);

      if (requestAmount > available) {
        return res.status(400).json({ success: false, message: "Insufficient balance" });
      }

      const withdrawalRequest = {
        driverId,
        amount: requestAmount,
        method,
        accountDetails,
        notes: notes || "",
        status: "pending",
        requestId: `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await collections.withdrawalsCollection.insertOne(withdrawalRequest);

      // Update rider balance: move from available to pending
      await ridersCollection.updateOne(
        { _id: new ObjectId(driverId) },
        {
          $inc: {
            availableBalance: -requestAmount,
            pendingWithdrawals: requestAmount
          },
          $set: { updatedAt: new Date() }
        }
      );

      res.status(201).json({
        success: true,
        message: "Withdrawal request submitted successfully",
        data: {
          requestId: withdrawalRequest.requestId,
          id: result.insertedId
        }
      });
    } catch (error) {
      console.error("Withdrawal request error:", error);
      res.status(500).json({ success: false, message: "Failed to submit withdrawal request" });
    }
  });

  // 🔹 Get Schedule
  router.get("/schedule", async (req, res) => {
    try {
      const { driverId } = req.query;
      if (!driverId || !ObjectId.isValid(driverId)) {
        return res.status(400).json({ success: false, message: "Invalid Driver ID" });
      }

      const rider = await ridersCollection.findOne({ _id: new ObjectId(driverId) });
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

      res.json({
        success: true,
        data: {
          workingDays: rider.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          workingHours: rider.workingHours || { start: "09:00", end: "17:00" },
          vacationMode: rider.vacationMode || false,
          isOnline: rider.isOnline || false
        }
      });
    } catch (error) {
      console.error("Fetch schedule error:", error);
      res.status(500).json({ success: false, message: "Failed to fetch schedule" });
    }
  });

  // 🔹 Update Schedule
  router.put("/schedule", async (req, res) => {
    try {
      const { driverId, workingDays, workingHours, vacationMode } = req.body;

      if (!driverId || !ObjectId.isValid(driverId)) {
        return res.status(400).json({ success: false, message: "Invalid Driver ID" });
      }

      const updateFields = {
        workingDays,
        workingHours,
        vacationMode,
        updatedAt: new Date()
      };

      // Automatically take driver offline if vacation mode is enabled
      if (vacationMode) {
        updateFields.isOnline = false;
      }

      const result = await ridersCollection.updateOne(
        { _id: new ObjectId(driverId) },
        { $set: updateFields }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: "Rider not found" });
      }

      res.json({
        success: true,
        message: "Schedule updated successfully",
        data: updateFields
      });
    } catch (error) {
      console.error("Update schedule error:", error);
      res.status(500).json({ success: false, message: "Failed to update schedule" });
    }
  });

  // 🔹 Get Single Rider
  router.get("/:id", async (req, res) => {
    try {
      const rider = await ridersCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!rider) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: rider });
    } catch (error) {
      res.status(500).json({ success: false, message: "Fetch failed" });
    }
  });

  // 🔹 Update Rider
  router.patch("/:id", async (req, res) => {
    try {
      const updateData = req.body;
      delete updateData.password;
      delete updateData._id;

      await ridersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      res.json({ success: true, message: "Updated" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Update failed" });
    }
  });

  // 🔹 Update Password
  router.put("/:id/password", async (req, res) => {
    try {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid Rider ID" });
      }

      if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "Invalid generic password criteria. Must be at least 6 characters." });
      }

      const rider = await ridersCollection.findOne({ _id: new ObjectId(id) });
      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, rider.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Current password is incorrect" });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      await ridersCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { password: hashedPassword, updatedAt: new Date() } }
      );

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Password update error:", error);
      res.status(500).json({ success: false, message: "Failed to update password" });
    }
  });

  // 🔹 Delete Rider
  router.delete("/:id", async (req, res) => {
    try {
      await ridersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
      res.json({ success: true, message: "Deleted" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Delete failed" });
    }
  });

  return router;
};