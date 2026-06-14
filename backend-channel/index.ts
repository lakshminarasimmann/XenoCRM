import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/receipt';

// Simulated metrics (percentages)
const DELIVER_RATE = 0.95;
const OPEN_RATE = 0.40;
const CLICK_RATE = 0.15;

app.post('/api/send', (req, res) => {
  const { campaignId, customerId, channel, message } = req.body;

  if (!campaignId || !customerId) {
    return res.status(400).json({ error: 'campaignId and customerId required' });
  }

  // Acknowledge receipt immediately
  res.status(202).json({ status: 'PENDING', message: 'Message queued for delivery' });

  // Simulate delivery process asynchronously
  setTimeout(async () => {
    try {
      const isDelivered = Math.random() < DELIVER_RATE;
      
      if (!isDelivered) {
        // Send FAILED webhook
        await sendWebhook({ campaignId, customerId, status: 'FAILED' });
        return; // End of simulation for this message
      }

      // Send DELIVERED webhook
      await sendWebhook({ campaignId, customerId, status: 'DELIVERED' });

      // Simulate open event
      setTimeout(async () => {
        const isOpened = Math.random() < OPEN_RATE;
        if (!isOpened) return;

        await sendWebhook({ campaignId, customerId, status: 'OPENED' });

        // Simulate click event
        setTimeout(async () => {
          const isClicked = Math.random() < CLICK_RATE;
          if (!isClicked) return;

          await sendWebhook({ campaignId, customerId, status: 'CLICKED' });
        }, Math.random() * 5000 + 1000); // 1-6s delay for click

      }, Math.random() * 5000 + 1000); // 1-6s delay for open

    } catch (err) {
      console.error('Failed to process simulation:', err);
    }
  }, Math.random() * 3000 + 500); // 0.5-3.5s delay for delivery
});

async function sendWebhook(payload: { campaignId: string, customerId: string, status: string }) {
  try {
    console.log(`Sending webhook: ${payload.campaignId} -> ${payload.customerId} -> ${payload.status}`);
    await axios.post(CRM_WEBHOOK_URL, payload);
  } catch (err: any) {
    console.error(`Webhook failed for ${payload.status}: ${err.message}`);
  }
}

app.listen(PORT, () => {
  console.log(`Channel Service Stub listening on port ${PORT}`);
});
