const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = function (collections) {
  const router = express.Router();
  const { ridersCollection, ridesCollection, reviewsCollection } = collections;

  // 🔹 Multer Configuration for Rider Uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, "../uploads/riders");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
        cb(null, true);
      } else {
        cb(new Error("Only images and PDF files are allowed"));
      }
    },
  });

  // 🔹 API: Upload Single Payload Image (Rider Profile Picture)
  router.post("/upload", upload.single("riderImage"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });
      const fileUrl = `/uploads/riders/${req.file.filename}`;
      res.status(200).json({ success: true, url: fileUrl });
    } catch (err) {
      console.error("Single Upload Error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  });

  // 🔹 API: Upload Multiple Documents to existing Rider Document
  router.post("/:id/documents", upload.fields([
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleRegistration', maxCount: 1 }
  ]), async (req, res) => {
    try {
      if (!req.files) return res.status(400).json({ success: false, message: "No documents provided" });

      const newDocs = {};
      if (req.files.drivingLicense) {
        newDocs["documents.drivingLicenseFile"] = `/uploads/riders/${req.files.drivingLicense[0].filename}`;
      }
      if (req.files.vehicleRegistration) {
        newDocs["documents.vehicleRegistrationFile"] = `/uploads/riders/${req.files.vehicleRegistration[0].filename}`;
      }

      await ridersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: newDocs }
      );

      res.status(200).json({ success: true, message: "Documents uploaded securely", parsed: newDocs });
    } catch (err) {
      console.error("Multi Document Upload Error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  });

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
        emergencyContact,
        identity,
        referralCode,
        licenseNumber,
        vehicle,
        documents,
        operationCities,
        image
      } = req.body;

      console.log("--- New Registration Request ---");
      console.log("Headers:", req.headers["content-type"]);
      console.log("Incoming Rider Data:", JSON.stringify(req.body, null, 2));

      const requiredFields = ["firstName", "email", "phone"];
      const missingFields = requiredFields.filter(field => !req.body[field]);

      if (missingFields.length > 0) {
        console.warn(`Registration failed: Missing fields - ${missingFields.join(", ")}`);
        return res.status(400).json({
          success: false,
          message: `Required fields missing: ${missingFields.join(", ")}`,
          missingFields
        });
      }

      const existing = await ridersCollection.findOne({ email });
      if (existing) {
        console.warn(`Registration failed: Email ${email} already exists`);
        return res.status(400).json({
          success: false,
          message: "A rider account already exists with this email address."
        });
      }

      const defaultPassword = "onway_rider_pass";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      const rider = {
        name: `${firstName || ''} ${lastName || ''}`.trim(),
        email: email || '',
        phone: phone || '',
        password: hashedPassword,
        address: address || { district: "", city: "" },
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        emergencyContact: emergencyContact || { name: "", phone: "" },
        identity: identity || { type: "NID", number: "" },
        referralCode: referralCode || null,
        licenseNumber: licenseNumber || null,
        vehicle: vehicle || { category: "bike", type: "", number: "", model: "", registrationNumber: "" },
        documents: documents || { drivingLicenseFile: "", vehicleRegistrationFile: "" },
        operationCities: operationCities || [],
        image: image || null,
        role: "rider",
        isApproved: false,
        status: "offline",
        currentRideId: null,
        rating: 5.0,
        totalTrips: 0,
        location: {
          type: "Point",
          coordinates: [90.4125, 23.8103] // Default to Dhaka, Bangladesh
        },
        lastLocationUpdate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await ridersCollection.insertOne(rider);

      // 🔔 Send notification to admins about new rider registration
      try {
        const notificationHelper = require("../utils/notificationHelper");

        // Get all collections from request
        const collections = {
          notificationsCollection: req.collections?.notificationsCollection,
          passengerCollection: req.collections?.passengerCollection,
        };

        if (collections.notificationsCollection && collections.passengerCollection) {
          await notificationHelper.notifyRiderRegistration(collections, {
            _id: result.insertedId,
            name: rider.name,
            email: rider.email,
            phone: rider.phone,
            isApproved: rider.isApproved,
          });
        }
      } catch (notifError) {
        console.error("Notification error:", notifError);
        // Don't fail the registration if notification fails
      }

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
          status: driver.status || "offline",
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

  // 🔹 PATCH Toggle Online (New synchronized endpoint)
  router.patch("/:id/online", async (req, res) => {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      let rider = await ridersCollection.findOne({ _id: new ObjectId(id) });
      let updateCriteria = { _id: new ObjectId(id) };

      // Fallback: Check if ID belongs to a passenger document with rider role
      if (!rider && collections.passengerCollection) {
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(id) });
        if (passenger && passenger.email) {
          rider = await ridersCollection.findOne({ email: passenger.email });
          if (rider) updateCriteria = { email: passenger.email };
        }
      }

      if (!rider) {
        return res.status(404).json({ success: false, message: "Rider not found" });
      }

      if (!rider.isApproved) {
        return res.status(403).json({ success: false, message: "Rider not approved" });
      }

      if (rider.vacationMode === true) {
        return res.status(403).json({ success: false, message: "Rider is on vacation mode" });
      }

      await ridersCollection.updateOne(
        updateCriteria,
        { $set: { status: isOnline ? "online" : "offline", updatedAt: new Date() } }
      );

      console.log(`✅ [DB] Status persisted for ${rider.email}: ${isOnline ? "online" : "offline"}`);
      res.json({ success: true, isOnline, status: isOnline ? "online" : "offline" });
    } catch (error) {
      console.error("PATCH online error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // 🔹 PATCH Toggle Status (Compatibility)
  router.patch("/:id/online-status", async (req, res) => {
    try {
      const { id } = req.params;
      const { isOnline } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      let updateCriteria = { _id: new ObjectId(id) };
      const rider = await ridersCollection.findOne(updateCriteria);

      if (!rider && collections.passengerCollection) {
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(id) });
        if (passenger && passenger.email) {
          updateCriteria = { email: passenger.email };
        }
      }

      await ridersCollection.updateOne(
        updateCriteria,
        { $set: { status: isOnline ? "online" : "offline", updatedAt: new Date() } }
      );

      res.json({ success: true, isOnline, status: isOnline ? "online" : "offline" });
    } catch (error) {
      res.status(500).json({ success: false });
    }
  });

  // 🔹 PATCH Update Status (New consolidated endpoint)
  router.patch("/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowed = ["online", "offline", "busy"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
      }

      let updateCriteria = { _id: new ObjectId(id) };
      const rider = await ridersCollection.findOne(updateCriteria);

      if (!rider && collections.passengerCollection) {
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(id) });
        if (passenger && passenger.email) {
          updateCriteria = { email: passenger.email };
        }
      }

      await ridersCollection.updateOne(
        updateCriteria,
        {
          $set: {
            status,
            updatedAt: new Date()
          }
        }
      );

      res.json({ success: true, status });
    } catch (error) {
      console.error("PATCH status error:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  });

  // 🔹 Helper: Auto-Approve Rider (For dispatch testing)
  router.patch("/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      if (!ObjectId.isValid(id)) return res.status(400).json({ success: false });

      let updateCriteria = { _id: new ObjectId(id) };
      const rider = await ridersCollection.findOne(updateCriteria);

      if (!rider && collections.passengerCollection) {
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(id) });
        if (passenger && passenger.email) {
          updateCriteria = { email: passenger.email };
        }
      }

      await ridersCollection.updateOne(
        updateCriteria,
        { $set: { isApproved: true, updatedAt: new Date() } }
      );
      res.json({ success: true, message: "Rider approved for dispatch" });
    } catch (err) {
      res.status(500).json({ success: false });
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

      let rider = await ridersCollection.findOne({ _id: new ObjectId(driverId) });

      // Fallback for cross-platform Passenger accounts attempting to access a connected driver dashboard
      if (!rider && collections.passengerCollection) {
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(driverId) });
        if (passenger && passenger.email) {
          rider = await ridersCollection.findOne({ email: passenger.email });
        }
      }

      if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

      res.json({
        success: true,
        data: {
          workingDays: rider.workingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          workingHours: rider.workingHours || { start: "09:00", end: "17:00" },
          vacationMode: rider.vacationMode || false,
          status: rider.status || "offline"
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

      let searchTarget = { _id: new ObjectId(driverId) };

      // Fallback check: Did this user sign in under a Passenger session ID?
      const directRider = await ridersCollection.findOne(searchTarget);
      if (!directRider && collections.passengerCollection) {
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(driverId) });
        if (passenger && passenger.email) {
          searchTarget = { email: passenger.email };
        } else {
          return res.status(404).json({ success: false, message: "Rider not found attached to session" });
        }
      }

      const updateFields = {
        workingDays,
        workingHours,
        vacationMode,
        updatedAt: new Date()
      };

      // Automatically take driver offline if vacation mode is enabled
      if (vacationMode) {
        updateFields.status = "offline";
      }

      const result = await ridersCollection.updateOne(
        searchTarget,
        { $set: updateFields }
      );

      // (If result.matchedCount === 0 here, it means the database returned weird constraints, but theoretically prevented by checking above)

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
      let rider = await ridersCollection.findOne({ _id: new ObjectId(req.params.id) });

      if (!rider) {
        // Fallback to passenger collection
        if (collections.passengerCollection) {
          const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(req.params.id) });
          if (passenger) {
            // Find detailed rider info by email
            const detailedRider = await ridersCollection.findOne({ email: passenger.email });
            rider = detailedRider || passenger;
          }
        }
      }

      if (!rider) return res.status(404).json({ success: false, message: "Not found" });
      res.json({ success: true, data: rider });
    } catch (error) {
      console.error("Fetch rider error:", error);
      res.status(500).json({ success: false, message: "Fetch failed" });
    }
  });

  // 🔹 Update Rider
  router.patch("/:id", async (req, res) => {
    try {
      const updateData = req.body;
      delete updateData.password;
      delete updateData._id;

      let result = await ridersCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      if (result.matchedCount === 0 && collections.passengerCollection) {
        // Try identifying by email via passenger
        const passenger = await collections.passengerCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (passenger) {
          result = await ridersCollection.updateOne(
            { email: passenger.email },
            { $set: { ...updateData, updatedAt: new Date() } }
          );
          if (result.matchedCount === 0) {
            // Update passenger directly if no rider record exists
            await collections.passengerCollection.updateOne(
              { _id: new ObjectId(req.params.id) },
              { $set: { ...updateData, updatedAt: new Date() } }
            );
          }
        }
      }

      res.json({ success: true, message: "Updated" });
    } catch (error) {
      console.error("Patch rider error:", error);
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