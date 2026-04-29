const express = require("express");
const cors = require("cors");

// SSLCommerz callback routes need to allow all origins (POST from SSLCommerz servers)
const sslCors = cors({ origin: "*", methods: ["POST", "GET"] });

module.exports = function (collections) {
  const router = express.Router();
  const paymentsCollection = collections.paymentsCollection;
  const bookingsCollection = collections.bookingsCollection;
  const passengerCollection = collections.passengerCollection;
  const { ObjectId } = require("mongodb");

  router.post("/initiate", async (req, res) => {
    try {
      const { amount, customerName, customerEmail, customerPhone, productName, paymentMethod, bookingId } = req.body;

      // Cash on Service handle
      if (paymentMethod === "cash") {
        const cashPayment = {
          transactionId: `CASH-${Date.now()}`,
          amount,
          customerName,
          customerEmail,
          customerPhone,
          productName,
          paymentMethod: "cash",
          bookingId: bookingId || null,
          status: "pending",
          createdAt: new Date(),
        };

        await paymentsCollection.insertOne(cashPayment);

        // Update booking status if bookingId exists
        if (bookingId && ObjectId.isValid(bookingId)) {
          await bookingsCollection.updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: { paymentMethod: "cash", paymentStatus: "pending", updatedAt: new Date() } }
          );
        }

        return res.json({
          success: true,
          message: "Cash payment recorded",
          data: cashPayment,
        });
      }

      // SSLCommerz integration
      const SSLCommerzPayment = require('sslcommerz-lts');
      const store_id = process.env.SSLCOMMERZ_STORE_ID;
      const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
      const is_live = process.env.SSLCOMMERZ_IS_LIVE === 'true';

      const transactionId = `TXN-${Date.now()}`;

      // SSLCommerz payment data
      const paymentData = {
        total_amount: amount,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${process.env.FRONTEND_URL}/api/payment/success`,
        fail_url: `${process.env.FRONTEND_URL}/api/payment/fail`,
        cancel_url: `${process.env.FRONTEND_URL}/api/payment/cancel`,
        ipn_url: `${process.env.BACKEND_URL}/api/payment/ipn`,
        product_name: productName,
        product_category: "Service",
        cus_name: customerName,
        cus_email: customerEmail,
        cus_phone: customerPhone,
        cus_add1: "Dhaka",
        cus_city: "Dhaka",
        cus_country: "Bangladesh",
        shipping_method: "NO",
        product_profile: "general",
        value_a: bookingId || "" // Use value_a to store bookingId
      };

      // Direct payment method routing
      if (paymentMethod === "bkash") {
        paymentData.allowed_bin = "bkash";
        paymentData.multi_card_name = "bkash";
        paymentData.emi_option = 0;
      } else if (paymentMethod === "nagad") {
        paymentData.allowed_bin = "nagad";
        paymentData.multi_card_name = "nagad";
        paymentData.emi_option = 0;
      } else if (paymentMethod === "card") {
        paymentData.allowed_bin = "visa,master,amex";
        paymentData.multi_card_name = "visa,master,amex";
        paymentData.emi_option = 0;
      }


      await paymentsCollection.insertOne({
        transactionId,
        ...paymentData,
        bookingId: bookingId || null,
        paymentMethod,
        status: "initiated",
        createdAt: new Date(),
      });

      // SSLCommerz integration
      const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
      const apiResponse = await sslcz.init(paymentData);

      if (apiResponse.GatewayPageURL) {
        let gatewayUrl = apiResponse.GatewayPageURL;


        if (paymentMethod === "bkash" || paymentMethod === "nagad") {
          gatewayUrl += "?type=mobilebanking";
        } else if (paymentMethod === "card") {
          gatewayUrl += "?type=cards";
        }

        return res.json({ success: true, gatewayUrl: gatewayUrl });
      } else {
        return res.status(400).json({ success: false, message: "Failed to initialize payment gateway" });
      }
    } catch (error) {
      console.error("Payment initiate error:", error);
      res.status(500).json({ success: false, message: "Payment initiation failed" });
    }
  });

  // Helper to update booking status
  const updateBookingPaymentStatus = async (transactionId, status) => {
    try {
      const payment = await paymentsCollection.findOne({ transactionId });
      if (payment && payment.bookingId && ObjectId.isValid(payment.bookingId)) {
        const result = await bookingsCollection.updateOne(
          { _id: new ObjectId(payment.bookingId) },
          { $set: { paymentStatus: status, updatedAt: new Date() } }
        );
        console.log(`✅ [PAYMENT] Booking ${payment.bookingId} update result:`, result.modifiedCount > 0 ? "success" : "no-change");
        return result.modifiedCount > 0 || result.matchedCount > 0;
      }
    } catch (err) {
      console.error("❌ Error updating booking payment status:", err);
    }
    return false;
  };

  // Payment success callback
  router.post("/success", sslCors, async (req, res) => {
    try {
      const { tran_id } = req.body;

      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: "success", updatedAt: new Date() } }
      );

      const success = await updateBookingPaymentStatus(tran_id, "paid");

      const payment = await paymentsCollection.findOne({ transactionId: tran_id });
      const bookingId = payment?.bookingId;

      if (bookingId) {
        const verifiedBooking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        console.log(`🧐 [VERIFICATION] Booking ${bookingId} status is: ${verifiedBooking?.paymentStatus}`);

        // ── Passenger notification ────────────────────────────────────────────
        if (verifiedBooking?.passengerId && req.collections?.notificationsCollection) {
          const notificationHelper = require("../utils/notificationHelper");
          await notificationHelper.notifyPassenger(
            req.collections.notificationsCollection,
            verifiedBooking.passengerId.toString(),
            "PAYMENT_SUCCESS",
            `Payment of ৳${verifiedBooking.price || payment?.total_amount || 0} received successfully.`,
            { bookingId, transactionId: tran_id }
          );
        }
        // ─────────────────────────────────────────────────────────────────────
      }

      const redirectUrl = `${process.env.FRONTEND_URL}/payment/success?transaction=${tran_id}${bookingId ? `&bookingId=${bookingId}` : ''}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Payment success error:", error);
      res.status(500).json({ success: false, message: "Error processing success" });
    }
  });

  // Payment fail callback
  router.post("/fail", sslCors, async (req, res) => {
    try {
      const { tran_id } = req.body;

      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: "failed", updatedAt: new Date() } }
      );

      await updateBookingPaymentStatus(tran_id, "failed");

      const payment = await paymentsCollection.findOne({ transactionId: tran_id });
      const bookingId = payment?.bookingId;

      // ── Passenger notification ──────────────────────────────────────────────
      if (bookingId) {
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        if (booking?.passengerId && req.collections?.notificationsCollection) {
          const notificationHelper = require("../utils/notificationHelper");
          await notificationHelper.notifyPassenger(
            req.collections.notificationsCollection,
            booking.passengerId.toString(),
            "PAYMENT_FAILED",
            "Your payment could not be processed. Please try again.",
            { bookingId, transactionId: tran_id }
          );
        }
      }
      // ─────────────────────────────────────────────────────────────────────────

      const redirectUrl = `${process.env.FRONTEND_URL}/payment/fail?transaction=${tran_id}${bookingId ? `&bookingId=${bookingId}` : ''}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Payment fail error:", error);
      res.status(500).json({ success: false, message: "Error processing failure" });
    }
  });

  // Payment cancel callback
  router.post("/cancel", sslCors, async (req, res) => {
    try {
      const { tran_id } = req.body;

      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: "cancelled", updatedAt: new Date() } }
      );

      await updateBookingPaymentStatus(tran_id, "cancelled");

      const payment = await paymentsCollection.findOne({ transactionId: tran_id });
      const bookingId = payment?.bookingId;
      const redirectUrl = `${process.env.FRONTEND_URL}/payment/cancel?transaction=${tran_id}${bookingId ? `&bookingId=${bookingId}` : ''}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error("Payment cancel error:", error);
      res.status(500).json({ success: false, message: "Error processing cancellation" });
    }
  });

  // IPN (Instant Payment Notification)
  router.post("/ipn", async (req, res) => {
    try {
      const { tran_id, status } = req.body;

      const newStatus = status.toLowerCase();
      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: newStatus, ipnReceived: true, updatedAt: new Date() } }
      );

      if (newStatus === "valid" || newStatus === "success") {
        await updateBookingPaymentStatus(tran_id, "paid");
      }

      res.json({ success: true });
    } catch (error) {
      console.error("IPN error:", error);
      res.status(500).json({ success: false });
    }
  });

  // Wallet Payment — deduct from passenger wallet balance
  router.post("/wallet-pay", async (req, res) => {
    try {
      const { passengerId, amount, bookingId, productName, currentBalance } = req.body;

      if (!passengerId || !amount) {
        return res.status(400).json({ success: false, message: "passengerId and amount are required" });
      }

      if (!ObjectId.isValid(passengerId)) {
        return res.status(400).json({ success: false, message: "Invalid passengerId" });
      }

      const payAmount = parseFloat(amount);

      // Use frontend-provided balance (localStorage) as source of truth since wallet is client-side
      // If currentBalance not provided, fall back to DB
      let effectiveBalance = currentBalance !== undefined ? parseFloat(currentBalance) : null;

      if (effectiveBalance === null) {
        const passenger = await passengerCollection.findOne({ _id: new ObjectId(passengerId) });
        if (!passenger) {
          return res.status(404).json({ success: false, message: "Passenger not found" });
        }
        effectiveBalance = passenger.walletBalance || 0;
      }

      if (effectiveBalance < payAmount) {
        return res.status(400).json({
          success: false,
          message: "Insufficient wallet balance",
          currentBalance: effectiveBalance,
          required: payAmount,
        });
      }

      const newBalance = effectiveBalance - payAmount;
      const transactionId = `WALLET-${Date.now()}`;

      // Sync new balance to DB
      await passengerCollection.updateOne(
        { _id: new ObjectId(passengerId) },
        {
          $set: { walletBalance: newBalance, updatedAt: new Date() },
          $push: {
            walletTransactions: {
              transactionId,
              type: "debit",
              amount: payAmount,
              description: productName || "Ride Payment",
              bookingId: bookingId || null,
              status: "success",
              createdAt: new Date(),
            },
          },
        }
      );

      // Record in payments collection
      await paymentsCollection.insertOne({
        transactionId,
        amount: payAmount,
        passengerId,
        bookingId: bookingId || null,
        productName: productName || "Ride Payment",
        paymentMethod: "wallet",
        status: "success",
        createdAt: new Date(),
      });

      // Update booking payment status
      if (bookingId && ObjectId.isValid(bookingId)) {
        await bookingsCollection.updateOne(
          { _id: new ObjectId(bookingId) },
          { $set: { paymentMethod: "wallet", paymentStatus: "paid", updatedAt: new Date() } }
        );
      }

      return res.json({
        success: true,
        message: "Wallet payment successful",
        transactionId,
        newBalance,
      });
    } catch (error) {
      console.error("Wallet pay error:", error);
      res.status(500).json({ success: false, message: "Wallet payment failed" });
    }
  });

  // Get user payment history
  router.get("/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const payments = await paymentsCollection
        .find({
          $or: [
            { "cus_email": userId }, // In case email is stored
            { "customerEmail": userId },
            { "userId": userId }
          ]
        })
        .sort({ createdAt: -1 })
        .toArray();

      res.json({ success: true, data: payments });
    } catch (error) {
      console.error("Get user payment history error:", error);
      res.status(500).json({ success: false, message: "Error fetching history" });
    }
  });

  // Get payment status
  router.get("/status/:transactionId", async (req, res) => {
    try {
      const payment = await paymentsCollection.findOne({
        transactionId: req.params.transactionId,
      });

      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found" });
      }

      res.json({ success: true, payment });
    } catch (error) {
      console.error("Get payment status error:", error);
      res.status(500).json({ success: false, message: "Error fetching payment status" });
    }
  });

  return router;
};
