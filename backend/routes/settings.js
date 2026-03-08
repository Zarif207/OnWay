const express = require("express");
const { ObjectId } = require("mongodb");

module.exports = (settingsCollection) => {
    const router = express.Router();

    // GET /api/settings - Get all platform settings
    router.get("/", async (req, res) => {
        try {
            let settings = await settingsCollection.findOne({ type: "platform" });
            
            // If no settings exist, create default settings
            if (!settings) {
                const defaultSettings = {
                    type: "platform",
                    // Platform Configuration
                    rideConfig: {
                        baseFare: 50,
                        perKmRate: 15,
                        perMinuteRate: 2,
                        commissionPercentage: 20,
                        driverApprovalMode: "manual", // manual or auto
                        cancellationWindow: 5, // minutes
                        cancellationFee: 20
                    },
                    // Notification Settings
                    notifications: {
                        emailEnabled: true,
                        smsEnabled: true,
                        pushEnabled: true,
                        bookingConfirmation: true,
                        rideReminders: true,
                        promotionalEmails: false
                    },
                    // Security Settings
                    security: {
                        sessionTimeout: 30, // days
                        maxLoginAttempts: 5,
                        twoFactorEnabled: false,
                        passwordMinLength: 6
                    },
                    // Data Management
                    dataManagement: {
                        autoBackupEnabled: true,
                        backupFrequency: "daily", // daily, weekly, monthly
                        dataRetentionDays: 90,
                        logRetentionDays: 30
                    },
                    updatedAt: new Date(),
                    createdAt: new Date()
                };
                
                await settingsCollection.insertOne(defaultSettings);
                settings = defaultSettings;
            }

            res.status(200).json({
                success: true,
                data: settings
            });
        } catch (error) {
            console.error("Fetch Settings Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch settings",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PATCH /api/settings/ride-config - Update ride configuration
    router.patch("/ride-config", async (req, res) => {
        try {
            const { baseFare, perKmRate, perMinuteRate, commissionPercentage, driverApprovalMode, cancellationWindow, cancellationFee } = req.body;

            const updateData = {};
            if (baseFare !== undefined) updateData["rideConfig.baseFare"] = Number(baseFare);
            if (perKmRate !== undefined) updateData["rideConfig.perKmRate"] = Number(perKmRate);
            if (perMinuteRate !== undefined) updateData["rideConfig.perMinuteRate"] = Number(perMinuteRate);
            if (commissionPercentage !== undefined) updateData["rideConfig.commissionPercentage"] = Number(commissionPercentage);
            if (driverApprovalMode) updateData["rideConfig.driverApprovalMode"] = driverApprovalMode;
            if (cancellationWindow !== undefined) updateData["rideConfig.cancellationWindow"] = Number(cancellationWindow);
            if (cancellationFee !== undefined) updateData["rideConfig.cancellationFee"] = Number(cancellationFee);
            updateData.updatedAt = new Date();

            const result = await settingsCollection.updateOne(
                { type: "platform" },
                { $set: updateData }
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Settings not found"
                });
            }

            res.status(200).json({
                success: true,
                message: "Ride configuration updated successfully"
            });
        } catch (error) {
            console.error("Update Ride Config Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update ride configuration",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PATCH /api/settings/notifications - Update notification settings
    router.patch("/notifications", async (req, res) => {
        try {
            const { emailEnabled, smsEnabled, pushEnabled, bookingConfirmation, rideReminders, promotionalEmails } = req.body;

            const updateData = {};
            if (emailEnabled !== undefined) updateData["notifications.emailEnabled"] = emailEnabled;
            if (smsEnabled !== undefined) updateData["notifications.smsEnabled"] = smsEnabled;
            if (pushEnabled !== undefined) updateData["notifications.pushEnabled"] = pushEnabled;
            if (bookingConfirmation !== undefined) updateData["notifications.bookingConfirmation"] = bookingConfirmation;
            if (rideReminders !== undefined) updateData["notifications.rideReminders"] = rideReminders;
            if (promotionalEmails !== undefined) updateData["notifications.promotionalEmails"] = promotionalEmails;
            updateData.updatedAt = new Date();

            await settingsCollection.updateOne(
                { type: "platform" },
                { $set: updateData }
            );

            res.status(200).json({
                success: true,
                message: "Notification settings updated successfully"
            });
        } catch (error) {
            console.error("Update Notifications Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update notification settings",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PATCH /api/settings/security - Update security settings
    router.patch("/security", async (req, res) => {
        try {
            const { sessionTimeout, maxLoginAttempts, twoFactorEnabled, passwordMinLength } = req.body;

            const updateData = {};
            if (sessionTimeout !== undefined) updateData["security.sessionTimeout"] = Number(sessionTimeout);
            if (maxLoginAttempts !== undefined) updateData["security.maxLoginAttempts"] = Number(maxLoginAttempts);
            if (twoFactorEnabled !== undefined) updateData["security.twoFactorEnabled"] = twoFactorEnabled;
            if (passwordMinLength !== undefined) updateData["security.passwordMinLength"] = Number(passwordMinLength);
            updateData.updatedAt = new Date();

            await settingsCollection.updateOne(
                { type: "platform" },
                { $set: updateData }
            );

            res.status(200).json({
                success: true,
                message: "Security settings updated successfully"
            });
        } catch (error) {
            console.error("Update Security Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update security settings",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // PATCH /api/settings/data-management - Update data management settings
    router.patch("/data-management", async (req, res) => {
        try {
            const { autoBackupEnabled, backupFrequency, dataRetentionDays, logRetentionDays } = req.body;

            const updateData = {};
            if (autoBackupEnabled !== undefined) updateData["dataManagement.autoBackupEnabled"] = autoBackupEnabled;
            if (backupFrequency) updateData["dataManagement.backupFrequency"] = backupFrequency;
            if (dataRetentionDays !== undefined) updateData["dataManagement.dataRetentionDays"] = Number(dataRetentionDays);
            if (logRetentionDays !== undefined) updateData["dataManagement.logRetentionDays"] = Number(logRetentionDays);
            updateData.updatedAt = new Date();

            await settingsCollection.updateOne(
                { type: "platform" },
                { $set: updateData }
            );

            res.status(200).json({
                success: true,
                message: "Data management settings updated successfully"
            });
        } catch (error) {
            console.error("Update Data Management Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to update data management settings",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // POST /api/settings/clear-cache - Clear application cache
    router.post("/clear-cache", async (req, res) => {
        try {
            // In a real application, this would clear Redis cache, CDN cache, etc.
            // For now, we'll just log the action
            console.log("Cache cleared at:", new Date());

            res.status(200).json({
                success: true,
                message: "Cache cleared successfully"
            });
        } catch (error) {
            console.error("Clear Cache Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to clear cache",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    // POST /api/settings/backup - Trigger manual backup
    router.post("/backup", async (req, res) => {
        try {
            // In a real application, this would trigger a database backup
            // For now, we'll just log the action
            const backupId = new ObjectId();
            console.log("Manual backup triggered:", backupId);

            res.status(200).json({
                success: true,
                message: "Backup initiated successfully",
                backupId: backupId
            });
        } catch (error) {
            console.error("Backup Error:", error);
            res.status(500).json({
                success: false,
                message: "Failed to initiate backup",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });

    return router;
};
