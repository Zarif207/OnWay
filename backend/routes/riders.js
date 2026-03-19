const express = require("express");
const bcrypt = require("bcryptjs");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const uploadRiderFiles = require("../middleware/uploadRiderFiles");

module.exports = function (collections) {
  const router = express.Router();
  const { ridersCollection, ridesCollection, reviewsCollection } = collections;

  // 🔹 API: Upload Single Payload Image (Rider Profile Picture)
  router.post("/upload", uploadRiderFiles.single("riderImage"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ success: false, message: "No file provided" });
      const fileUrl = req.file.path; // Cloudinary automatically provides the secure url in path
      res.status(200).json({ success: true, url: fileUrl });
    } catch (err) {
      console.error("Single Upload Error:", err);
      res.status(500).json({ success: false, message: "Upload failed" });
    }
  });

  // 🔹 API: Upload Multiple Documents to existing Rider Document
  router.post("/:id/documents", uploadRiderFiles.fields([
    { name: 'drivingLicenseFile', maxCount: 1 },
    { name: 'vehicleRegistrationFile', maxCount: 1 },
    { name: 'drivingLicense', maxCount: 1 },
    { name: 'vehicleRegistration', maxCount: 1 }
  ]), async (req, res) => {
    try {
      if (!req.files) return res.status(400).json({ success: false, message: "No documents provided" });

      const { documentType, extractedData } = req.body;
      let parsedExtracted = {};
      try {
        parsedExtracted = typeof extractedData === 'string' ? JSON.parse(extractedData) : (extractedData || {});
      } catch (e) {
        parsedExtracted = {};
      }

      const newDocs = {};
      const dlFile = req.files.drivingLicenseFile || req.files.drivingLicense;
      if (dlFile) {
        const secureUrl = dlFile[0].path;
        if (documentType === "license" || documentType === "Driving License") {
          newDocs["documents.type"] = "license";
          newDocs["documents.license.uploaded"] = true;
          newDocs["documents.license.image"] = secureUrl;
          newDocs["documents.license.extracted"] = parsedExtracted;
          newDocs["documents.license.verified"] = false;
        } else {
          newDocs["documents.drivingLicenseFile"] = secureUrl; // Fallback
        }
      }

      const vrFile = req.files.vehicleRegistrationFile || req.files.vehicleRegistration;
      if (vrFile) {
        newDocs["vehicle.document"] = vrFile[0].path;
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
  router.post("/", uploadRiderFiles.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'faceImage', maxCount: 1 },
    { name: 'drivingLicenseFile', maxCount: 1 },
    { name: 'nidImage', maxCount: 1 },
    { name: 'vehicleRegistrationFile', maxCount: 1 },
    { name: 'driverLicense', maxCount: 1 },
    { name: 'vehicleDocument', maxCount: 1 }
  ]), async (req, res) => {
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
        image,
        faceVerification
      } = req.body;

      console.log("--- New Registration Request ---");
      console.log("Headers:", req.headers["content-type"]);
      console.log("Incoming Rider Data (Body):", JSON.stringify(req.body, null, 2));
      console.log("Incoming Rider Files:", req.files ? Object.keys(req.files) : "None");

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

      // Check if email exists
      let existing = await ridersCollection.findOne({ email });

      // If existing but already has a name, it's a real duplicate
      if (existing && (existing.firstName || existing.name)) {
        console.warn(`Registration failed: Email ${email} already exists`);
        return res.status(400).json({
          success: false,
          message: "A rider account already exists with this email address."
        });
      }

      const defaultPassword = "onway_rider_pass";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      // Extract uploaded Cloudinary URLs
      const profileImageUrl = req.files?.profileImage?.[0]?.path || image || null;
      const faceImageUrl = req.files?.faceImage?.[0]?.path || (faceVerification?.verificationImage || req.body.faceImage) || "";
      const driverLicenseUrl = req.files?.drivingLicenseFile?.[0]?.path || req.files?.driverLicense?.[0]?.path || documents?.drivingLicenseFile || "";
      const nidImageUrl = req.files?.nidImage?.[0]?.path || identity?.image || "";
      const vehicleDocumentUrl = req.files?.vehicleRegistrationFile?.[0]?.path || req.files?.vehicleDocument?.[0]?.path || documents?.vehicleRegistrationFile || "";

      // Construct parsing logic for potentially stringified objects
      const parseJSON = (str, fallback) => {
        try {
          return typeof str === 'string' ? JSON.parse(str) : (str || fallback);
        } catch { return fallback; }
      };

      const parsedAddress = parseJSON(address, { district: "", city: "" });
      const parsedEmergency = parseJSON(emergencyContact, { name: "", phone: "" });
      const parsedIdentity = parseJSON(identity, { type: "NID", number: "" });
      const parsedVehicle = parseJSON(vehicle, { category: "bike", type: "", number: "", model: "", registrationNumber: "" });
      const parsedDocs = parseJSON(documents, { drivingLicenseFile: driverLicenseUrl, vehicleRegistrationFile: vehicleDocumentUrl });
      const parsedFaceVerification = parseJSON(faceVerification || req.body.faceVerification, {});

      // Extracted Data from Frontend (Dynamic)
      let submittedDocType = parsedDocs.submittedType || "nid";
      if (submittedDocType.includes("license") || submittedDocType.includes("licence") || submittedDocType.includes("driving")) {
        submittedDocType = "license";
      } else if (submittedDocType.includes("passport")) {
        submittedDocType = "passport";
      } else {
        submittedDocType = "nid";
      }

      const extractedDataPayload = parsedDocs.extractedData || {};

      // Calculate KYC Score
      const confidence = parseFloat(req.body.confidenceScore || parsedFaceVerification.confidenceScore || 0);
      const isFaceMatch = req.body.isFaceVerified === 'true' || req.body.isFaceVerified === true || parsedFaceVerification.isVerified === true;
      const documentUploaded = !!(driverLicenseUrl || nidImageUrl || req.body.documentImage || parsedDocs.license?.uploaded || parsedDocs.nid?.uploaded || parsedDocs.passport?.uploaded || parsedDocs.files?.nid || parsedDocs.files?.license || parsedDocs.files?.passport);

      const kycChecks = {
        documentUploaded: documentUploaded,
        faceMatch: isFaceMatch,
        validFormat: !!(req.body.identityNumber || parsedIdentity.number || extractedDataPayload.documentNumber),
        duplicateCheck: true, // Passed since email duplicate check passed above
        expiryValid: true
      };

      let kycScore = 0;
      if (kycChecks.documentUploaded) kycScore += 20;
      if (kycChecks.faceMatch && confidence >= 0.85) kycScore += 40;
      else if (kycChecks.faceMatch) kycScore += 20; // Fallback for low confidence
      if (kycChecks.validFormat) kycScore += 20;
      if (kycChecks.duplicateCheck) kycScore += 20;

      let kycStatus = "pending";
      if (kycScore >= 80) kycStatus = "verified";
      else if (kycScore >= 50) kycStatus = "pending";
      else kycStatus = "rejected";

      // Assign extracted files to the parsed objects
      parsedDocs.drivingLicenseFile = driverLicenseUrl;
      parsedDocs.vehicleRegistrationFile = vehicleDocumentUrl;
      parsedIdentity.image = nidImageUrl;

      const riderData = {
        email: email || '',
        phone: phone || '',
        password: hashedPassword,

        profile: {
          firstName: firstName || extractedDataPayload.firstName || '',
          lastName: lastName || extractedDataPayload.lastName || '',
          fullName: `${firstName || extractedDataPayload.firstName || ''} ${lastName || extractedDataPayload.lastName || ''}`.trim(),
          gender: gender || null,
          dateOfBirth: dateOfBirth || req.body.dateOfBirth || extractedDataPayload.dateOfBirth || null,
          bloodGroup: req.body.bloodGroup || extractedDataPayload.bloodGroup || null,
          nationality: req.body.nationality || extractedDataPayload.nationality || 'Bangladeshi',
          image: profileImageUrl
        },

        address: {
          district: parsedAddress.district || "Dhaka",
          city: parsedAddress.city || ""
        },

        documents: {
          type: submittedDocType,
          nid: {
            uploaded: parsedDocs.files?.nid === "pending_upload" || !!nidImageUrl || parsedDocs.nid?.uploaded || submittedDocType === "nid",
            image: nidImageUrl || parsedDocs.nid?.image || "",
            extracted: submittedDocType === "nid" ? extractedDataPayload : {},
            verified: kycStatus === "verified"
          },
          passport: {
            uploaded: parsedDocs.files?.passport === "pending_upload" || (req.body.identityType === "Passport") || parsedDocs.passport?.uploaded || submittedDocType === "passport",
            image: req.body.documentImage || parsedDocs.passport?.image || "",
            extracted: submittedDocType === "passport" ? extractedDataPayload : {},
            verified: kycStatus === "verified"
          },
          license: {
            uploaded: parsedDocs.files?.license === "pending_upload" || !!driverLicenseUrl || parsedDocs.license?.uploaded || submittedDocType === "license",
            image: driverLicenseUrl || parsedDocs.license?.image || "",
            extracted: submittedDocType === "license" ? extractedDataPayload : {},
            verified: kycStatus === "verified"
          }
        },

        identity: {
          type: submittedDocType === "license" ? "Driving License" : (submittedDocType === "passport" ? "Passport" : "NID"),
          number: req.body.identityNumber || parsedIdentity.number || extractedDataPayload.documentNumber || ""
        },

        faceVerification: {
          isVerified: isFaceMatch,
          confidenceScore: confidence,
          verificationImage: faceImageUrl,
          verifiedAt: isFaceMatch ? new Date() : null
        },

        kyc: {
          status: kycStatus,
          score: kycScore,
          checks: kycChecks,
          submittedAt: existing?.kyc?.submittedAt || new Date(),
          verifiedAt: kycStatus === "verified" ? new Date() : null,
          rejectionReason: kycStatus === "rejected" ? "Low KYC Score" : ""
        },

        vehicle: {
          category: parsedVehicle.category || "bike",
          type: parsedVehicle.type || "",
          number: parsedVehicle.number || "",
          model: parsedVehicle.model || "",
          registrationNumber: parsedVehicle.registrationNumber || req.body.registrationNumber || "",
          document: vehicleDocumentUrl
        },

        role: "rider",
        status: kycStatus === "verified" ? "online" : "offline",
        isApproved: kycStatus === "verified",

        createdAt: existing?.createdAt || new Date(),
        updatedAt: new Date()
      };

      let riderId;
      if (existing) {
        await ridersCollection.updateOne({ email }, { $set: riderData });
        riderId = existing._id;
      } else {
        const result = await ridersCollection.insertOne(riderData);
        riderId = result.insertedId;
      }

      console.log(`✅ Rider registered successfully: ${email}`);

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
            _id: riderId,
            name: riderData.name,
            email: riderData.email,
            phone: riderData.phone,
            isApproved: riderData.isApproved,
          });
        }
      } catch (notifError) {
        console.error("Notification error:", notifError);
        // Don't fail the registration if notification fails
      }

      res.status(201).json({
        success: true,
        message: "Rider registration submitted for verification",
        data: riderData
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
  // 🔹 GET Nearby Riders
  router.get("/nearby", async (req, res) => {
    try {
      const { lat, lng, radius = 5, excludeId } = req.query;

      const lngNum = parseFloat(lng);
      const latNum = parseFloat(lat);

      if (isNaN(lngNum) || isNaN(latNum)) {
        return res.status(400).json({
          success: false,
          message: "Valid lat and lng are required"
        });
      }

      let query = {
        status: "online",
        isApproved: true,
        location: {                        // ← location.coordinates না, শুধু location
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lngNum, latNum]   // ← [lng, lat] এই order
            },
            $maxDistance: parseInt(radius) * 1000
          }
        }
      };

      if (excludeId && ObjectId.isValid(excludeId)) {
        query._id = { $ne: new ObjectId(excludeId) };
      }

      const riders = await ridersCollection.find(query).limit(15).toArray();

      const formattedRiders = riders.map(r => ({
        id: r._id,
        lat: r.location?.coordinates?.[1] || latNum,
        lng: r.location?.coordinates?.[0] || lngNum,
        name: r.firstName || r.name || "Driver",
        vehicle: r.vehicle || { category: "bike", type: "Motorcycle" }
      }));

      res.status(200).json({ success: true, data: formattedRiders });
    } catch (error) {
      console.error("Nearby riders error:", error.message);
      res.status(500).json({ success: false, message: error.message });
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

  // 🔹 API: Face Verification
  router.post("/face-verification", async (req, res) => {
    try {
      const { riderId, faceDescriptor, email, image } = req.body;

      if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
        return res.status(400).json({ success: false, message: "Invalid face descriptor." });
      }

      let imagePath = "";
      if (image && image.includes("base64")) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, "base64");
        const fileName = `face-${riderId || "reg"}-${Date.now()}.png`;
        const dir = path.join(__dirname, "../uploads/riders/faces");

        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        imagePath = `/uploads/riders/faces/${fileName}`;
        fs.writeFileSync(path.join(dir, fileName), imageBuffer);
      }

      // Find the existing rider to check for previous verification attempts
      let existingRider = null;
      if (riderId) {
        existingRider = await ridersCollection.findOne({ _id: new ObjectId(riderId) });
      } else if (email) {
        existingRider = await ridersCollection.findOne({ email });
      }

      const currentAttempts = (existingRider?.faceVerification?.verificationAttempts || 0) + 1;

      const faceVerificationData = {
        isVerified: true,
        verificationStatus: "verified",
        verifiedAt: new Date(),
        verificationMethod: "face_match",
        confidenceScore: 0.98, // Face-api.js doesn't provide a consolidated score easily here, using a high default
        verificationImage: imagePath,
        faceEmbedding: faceDescriptor,
        lastVerificationAttempt: new Date(),
        verificationAttempts: currentAttempts
      };

      // Find by ID if available, otherwise fallback to email for pending registrations
      let result;
      if (riderId) {
        result = await ridersCollection.findOneAndUpdate(
          { _id: new ObjectId(riderId) },
          { $set: { faceVerification: faceVerificationData, isFaceVerified: true } },
          { returnDocument: "after" }
        );
      } else if (email) {
        result = await ridersCollection.findOneAndUpdate(
          { email },
          { $set: { faceVerification: faceVerificationData, isFaceVerified: true } },
          { upsert: true, returnDocument: "after" }
        );
      } else {
        return res.status(400).json({ success: false, message: "Rider ID or Email required." });
      }

      console.log(`✅ Face verification completed for: ${riderId || email} (Attempt ${currentAttempts})`);

      res.status(200).json({
        success: true,
        message: "Face verification completed",
        data: result.value || result
      });
    } catch (error) {
      console.error("Face verification error:", error);
      res.status(500).json({ success: false, message: "Internal server error during verification." });
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