const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = function (kycCollection, ridersCollection) {
  const router = express.Router();

  // POST /api/kyc/submit - Submit KYC documents
  router.post("/submit", async (req, res) => {
    try {
      const {
        riderId,
        email,
        fullName,
        dateOfBirth,
        nidNumber,
        nidFrontImage,   // base64 or URL
        nidBackImage,
        selfieImage,
        drivingLicenseNumber,
        drivingLicenseFrontImage,
        drivingLicenseBackImage,
        licenseExpiryDate,
        vehicleRegistrationNumber,
        vehicleRegistrationImage,
        taxTokenImage,
        taxTokenExpiry,
        fitnessImage,
        fitnessExpiry,
      } = req.body;

      if (!riderId || !email || !nidNumber || !nidFrontImage || !drivingLicenseNumber) {
        return res.status(400).json({
          success: false,
          message: "riderId, email, NID number, NID front image, and driving license number are required",
        });
      }

      // Check if KYC already submitted
      const existing = await kycCollection.findOne({ riderId });
      if (existing) {
        // Allow resubmission only if rejected
        if (existing.status === "pending" || existing.status === "approved") {
          return res.status(400).json({
            success: false,
            message: `KYC already ${existing.status}. Cannot resubmit.`,
          });
        }
        // Update rejected KYC
        await kycCollection.updateOne(
          { riderId },
          {
            $set: {
              fullName,
              dateOfBirth,
              nidNumber,
              nidFrontImage,
              nidBackImage: nidBackImage || null,
              selfieImage: selfieImage || null,
              drivingLicenseNumber,
              drivingLicenseFrontImage: drivingLicenseFrontImage || null,
              drivingLicenseBackImage: drivingLicenseBackImage || null,
              licenseExpiryDate: licenseExpiryDate || null,
              vehicleRegistrationNumber: vehicleRegistrationNumber || null,
              vehicleRegistrationImage: vehicleRegistrationImage || null,
              taxTokenImage: taxTokenImage || null,
              taxTokenExpiry: taxTokenExpiry || null,
              fitnessImage: fitnessImage || null,
              fitnessExpiry: fitnessExpiry || null,
              status: "pending",
              rejectionReason: null,
              resubmittedAt: new Date(),
              updatedAt: new Date(),
            },
          }
        );
        return res.json({ success: true, message: "KYC resubmitted successfully" });
      }

      const kycDoc = {
        riderId,
        email,
        fullName: fullName || "",
        dateOfBirth: dateOfBirth || null,
        nidNumber,
        nidFrontImage,
        nidBackImage: nidBackImage || null,
        selfieImage: selfieImage || null,
        drivingLicenseNumber,
        drivingLicenseFrontImage: drivingLicenseFrontImage || null,
        drivingLicenseBackImage: drivingLicenseBackImage || null,
        licenseExpiryDate: licenseExpiryDate || null,
        vehicleRegistrationNumber: vehicleRegistrationNumber || null,
        vehicleRegistrationImage: vehicleRegistrationImage || null,
        taxTokenImage: taxTokenImage || null,
        taxTokenExpiry: taxTokenExpiry || null,
        fitnessImage: fitnessImage || null,
        fitnessExpiry: fitnessExpiry || null,
        status: "pending",   // pending | approved | rejected
        rejectionReason: null,
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await kycCollection.insertOne(kycDoc);

      // Update rider's kycStatus field
      await ridersCollection.updateOne(
        { _id: new ObjectId(riderId) },
        { $set: { kycStatus: "pending", updatedAt: new Date() } }
      );

      res.status(201).json({
        success: true,
        message: "KYC submitted successfully. Awaiting admin review.",
        data: { kycId: result.insertedId },
      });
    } catch (error) {
      console.error("KYC submit error:", error);
      res.status(500).json({ success: false, message: "KYC submission failed" });
    }
  });

  // GET /api/kyc/rider/:riderId - Get KYC status for a rider
  router.get("/rider/:riderId", async (req, res) => {
    try {
      const kyc = await kycCollection.findOne({ riderId: req.params.riderId });
      if (!kyc) {
        return res.status(404).json({ success: false, message: "KYC not found" });
      }
      res.json({ success: true, data: kyc });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch KYC" });
    }
  });

  // GET /api/kyc - Get all KYC submissions (admin)
  router.get("/", async (req, res) => {
    try {
      const { status } = req.query;
      const filter = status && status !== "all" ? { status } : {};
      const kycs = await kycCollection.find(filter).sort({ submittedAt: -1 }).toArray();
      res.json({ success: true, data: kycs });
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch KYC list" });
    }
  });

  // PATCH /api/kyc/:id/approve - Admin approves KYC
  router.patch("/:id/approve", async (req, res) => {
    try {
      const kyc = await kycCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });

      await kycCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { status: "approved", approvedAt: new Date(), updatedAt: new Date() } }
      );

      // Update rider's kycStatus and isApproved
      await ridersCollection.updateOne(
        { _id: new ObjectId(kyc.riderId) },
        { $set: { kycStatus: "approved", isApproved: true, updatedAt: new Date() } }
      );

      res.json({ success: true, message: "KYC approved successfully" });
    } catch (error) {
      console.error("KYC approve error:", error);
      res.status(500).json({ success: false, message: "Failed to approve KYC" });
    }
  });

  // PATCH /api/kyc/:id/reject - Admin rejects KYC
  router.patch("/:id/reject", async (req, res) => {
    try {
      const { reason } = req.body;
      const kyc = await kycCollection.findOne({ _id: new ObjectId(req.params.id) });
      if (!kyc) return res.status(404).json({ success: false, message: "KYC not found" });

      await kycCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        {
          $set: {
            status: "rejected",
            rejectionReason: reason || "Documents not valid",
            rejectedAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      // Update rider's kycStatus
      await ridersCollection.updateOne(
        { _id: new ObjectId(kyc.riderId) },
        { $set: { kycStatus: "rejected", updatedAt: new Date() } }
      );

      res.json({ success: true, message: "KYC rejected" });
    } catch (error) {
      console.error("KYC reject error:", error);
      res.status(500).json({ success: false, message: "Failed to reject KYC" });
    }
  });

  return router;
};
