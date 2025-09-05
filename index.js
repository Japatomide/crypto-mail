import dotenv from "dotenv/config";
import nodemailer from "nodemailer";
import axios from "axios";
import express from "express";
import nodeCron from "node-cron";

// 1. Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

// 2. Fetch crypto data
async function getCryptoPrices() {
  try {
    const url =
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd";
    const response = await axios.get(url);
    return response.data;
  } catch (err) {
    console.error("❌ Error fetching prices", err.message);
    return null;
  }
}

// 3. Send email
async function sendEmail() {
  const prices = await getCryptoPrices();
  if (!prices) return;

  const mailOptions = {
    from: `"Crypto Price Bot" <${process.env.EMAIL_USER}>`,
    to: "jaiyeolapaul68@gmail.com", // change if you want multiple recipients
    subject: "⏰ Scheduled Crypto Price Update",
    html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; background: #f8f9fa; color: #333;">
      <h2 style="color: #2c3e50;">📊 Crypto Price Update</h2>
      <p>Here are the latest prices for your tracked coins:</p>
      <table style="border-collapse: collapse; width: 100%; margin-top: 10px;">
        <thead>
          <tr style="background: #2c3e50; color: white;">
            <th style="padding: 10px; text-align: left;">Coin</th>
            <th style="padding: 10px; text-align: left;">Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #ecf0f1;">
            <td style="padding: 10px;">Bitcoin (BTC)</td>
            <td style="padding: 10px;">$${prices.bitcoin.usd}</td>
          </tr>
          <tr>
            <td style="padding: 10px;">Ethereum (ETH)</td>
            <td style="padding: 10px;">$${prices.ethereum.usd}</td>
          </tr>
          <tr style="background: #ecf0f1;">
            <td style="padding: 10px;">Solana (SOL)</td>
            <td style="padding: 10px;">$${prices.solana.usd}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #777;">
        This update is sent automatically every 30 mins by your Crypto Price Bot 🚀
      </p>
    </div>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
  } catch (err) {
    console.error("❌ Error sending email:", err.message);
  }
}

// 4. Schedule every 2 hours
nodeCron.schedule("0 */2 * * *", () => {
  console.log("⏰ Running 30mins crypto alert job...");
  sendEmail();
});

// Web Service (health check only)
const app = express();
const PORT = process.env.PORT || 7000;

app.get("/", (req, res) => {
  res.send("✅ Crypto Email Service is running with cron enabled.");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Web service running on port ${PORT}`);
});

