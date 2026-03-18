const express = require("express");
const router = express.Router();

module.exports = function (paymentsCollection) {

  router.post("/initiate", async (req, res) => {
    try {
      const { amount, customerName, customerEmail, customerPhone, productName, paymentMethod } = req.body;

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
          status: "pending",
          createdAt: new Date(),
        };

        await paymentsCollection.insertOne(cashPayment);

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
        success_url: `${process.env.BACKEND_URL}/api/payment/success`,
        fail_url: `${process.env.BACKEND_URL}/api/payment/fail`,
        cancel_url: `${process.env.BACKEND_URL}/api/payment/cancel`,
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

  // Payment success callback
  router.post("/success", async (req, res) => {
    try {
      const { tran_id } = req.body;

      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: "success", updatedAt: new Date() } }
      );

      res.redirect(`${process.env.FRONTEND_URL}/payment/success?transaction=${tran_id}`);
    } catch (error) {
      console.error("Payment success error:", error);
      res.status(500).json({ success: false, message: "Error processing success" });
    }
  });

  // Payment fail callback
  router.post("/fail", async (req, res) => {
    try {
      const { tran_id } = req.body;

      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: "failed", updatedAt: new Date() } }
      );

      res.redirect(`${process.env.FRONTEND_URL}/payment/fail?transaction=${tran_id}`);
    } catch (error) {
      console.error("Payment fail error:", error);
      res.status(500).json({ success: false, message: "Error processing failure" });
    }
  });

  // Payment cancel callback
  router.post("/cancel", async (req, res) => {
    try {
      const { tran_id } = req.body;

      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: "cancelled", updatedAt: new Date() } }
      );

      res.redirect(`${process.env.FRONTEND_URL}/payment/cancel?transaction=${tran_id}`);
    } catch (error) {
      console.error("Payment cancel error:", error);
      res.status(500).json({ success: false, message: "Error processing cancellation" });
    }
  });

  // IPN (Instant Payment Notification)
  router.post("/ipn", async (req, res) => {
    try {
      const { tran_id, status } = req.body;

      await paymentsCollection.updateOne(
        { transactionId: tran_id },
        { $set: { status: status.toLowerCase(), ipnReceived: true, updatedAt: new Date() } }
      );

      res.json({ success: true });
    } catch (error) {
      console.error("IPN error:", error);
      res.status(500).json({ success: false });
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
