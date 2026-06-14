console.log("HELLO FROM INDEX.TS");
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
const PORT = process.env.PORT || 3000;
const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:3001/api/send';

// --- CUSTOMERS & ORDERS ---
app.get('/api/customers', async (req, res) => {
  const customers = await prisma.customer.findMany({ include: { orders: true } });
  res.json(customers);
});

app.get('/api/orders', async (req, res) => {
  const orders = await prisma.order.findMany({ include: { customer: true } });
  res.json(orders);
});

// --- SEGMENTS (AI NATIVE) ---
app.post('/api/segments', async (req, res) => {
  const { name, prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  try {
    let prismaWhere: any = {};
    const lowerPrompt = prompt.toLowerCase();
    
    // Simple Mock Keyword Detection
    if (lowerPrompt.includes('500') || lowerPrompt.includes('high')) {
      prismaWhere = { totalSpent: { gt: 500 } };
    } else if (lowerPrompt.includes('1000')) {
      prismaWhere = { totalSpent: { gt: 1000 } };
    } else if (lowerPrompt.includes('gmail')) {
      prismaWhere = { email: { endsWith: '@gmail.com' } };
    } else if (lowerPrompt.includes('inactive')) {
      prismaWhere = { lastPurchaseDate: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
    } else {
      prismaWhere = { totalSpent: { gt: 100 } };
    }

    const segmentCustomers = await prisma.customer.findMany({ where: prismaWhere });
    
    const segment = await prisma.segment.create({
      data: {
        name: name || `Segment: ${prompt.substring(0, 30)}`,
        criteria: JSON.stringify(prismaWhere),
        size: segmentCustomers.length
      }
    });

    res.json({ segment, customers: segmentCustomers });
  } catch (error: any) {
    console.error('Segment creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/segments', async (req, res) => {
  const segments = await prisma.segment.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(segments);
});

app.delete('/api/segments/:id', async (req, res) => {
  try {
    await prisma.segment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete segment' });
  }
});

// --- AI VALIDATION & SIMULATION ---
app.post('/api/campaigns/validate', async (req, res) => {
  const { messageTemplate } = req.body;
  if (!messageTemplate) return res.status(400).json({ error: 'messageTemplate required' });

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // Mock AI Delay
    const msg = messageTemplate.toLowerCase();
    const isSpam = msg.includes('urgent') || msg.includes('win') || msg.includes('$1,00,000') || msg.includes('claim');
    
    const result = {
      status: isSpam ? "FAIL" : "PASS",
      explanations: isSpam 
        ? ["Contains highly spammy keywords like 'urgent', 'win', or cash amounts.", "High likelihood of being blocked by carriers as a scam.", "Direct links to 'claim' prizes are heavily penalized by algorithms."]
        : ["The message tone is professional and engaging.", "No spam trigger words detected.", "Call to action is clear."]
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate campaign' });
  }
});

app.post('/api/campaigns/simulate', async (req, res) => {
  const { messageTemplate, segmentId } = req.body;
  if (!messageTemplate || !segmentId) return res.status(400).json({ error: 'messageTemplate and segmentId required' });

  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Mock AI Delay
    const result = {
      deliveryProbability: "98.5%",
      openRate: "42.3%",
      ctr: "18.7%",
      spamProbability: 2,
      recommendedTime: "Tomorrow, 10:00 AM",
      fatigueScore: 3,
      explanations: [
        "Historical data shows high engagement for this segment on weekday mornings.",
        "The concise message length contributes to a high predicted open rate.",
        "Audience fatigue is low; they haven't been over-messaged recently."
      ]
    };
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate campaign' });
  }
});

// --- CAMPAIGNS ---
app.post('/api/campaigns/draft', async (req, res) => {
  const { segmentId, prompt } = req.body;
  if (!segmentId || !prompt) return res.status(400).json({ error: 'segmentId and prompt required' });

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // Mock AI Delay
    const variants = [
      "Exclusive offer just for you! Use code XENO20 at checkout for 20% off your next purchase. Shop now!",
      "We noticed you love our products! Here's a special discount to show our appreciation. Click here to claim.",
      "Don't miss out on our latest collection. VIP access starts today! Reply STOP to opt out."
    ];
    res.json({ variants });
  } catch (error) {
    res.status(500).json({ error: 'Failed to draft messages' });
  }
});

app.post('/api/campaigns', async (req, res) => {
  const { name, segmentId, prompt, messageTemplate } = req.body;
  
  if (!segmentId) return res.status(400).json({ error: 'segmentId required' });

  let finalMessage = messageTemplate;

  // AI Message Generation if a prompt is provided
  if (prompt && !messageTemplate) {
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Mock AI Delay
      finalMessage = "Exclusive offer! Enjoy 20% off your next purchase with code XENO20. Shop now!";
    } catch (e) {
      return res.status(500).json({ error: 'Failed to generate message' });
    }
  }

  if (!finalMessage) return res.status(400).json({ error: 'Message content is required' });

  const campaign = await prisma.campaign.create({
    data: {
      name,
      segmentId,
      messageTemplate: finalMessage,
      status: 'SENDING'
    }
  });

  // Start sending process
  sendCampaignCommunications(campaign.id, segmentId, finalMessage);

  res.json(campaign);
});

async function sendCampaignCommunications(campaignId: string, segmentId: string, message: string) {
  try {
    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    if (!segment) return;
    
    const criteria = JSON.parse(segment.criteria);
    const customers = await prisma.customer.findMany({ where: criteria });

    // 1. Bulk insert all logs instantly to avoid SQLite locks
    const logsData = customers.map(c => ({
      campaignId,
      customerId: c.id,
      status: 'PENDING'
    }));
    
    // SQLite can handle massive createMany instantly
    await prisma.communicationLog.createMany({
      data: logsData
    });

    // 2. Process HTTP requests in batches so we don't blow up the Node.js event loop
    const BATCH_SIZE = 50;
    for (let i = 0; i < customers.length; i += BATCH_SIZE) {
      const batch = customers.slice(i, i + BATCH_SIZE);
      
      // Fire requests concurrently
      await Promise.all(batch.map(customer => 
        axios.post(CHANNEL_SERVICE_URL, {
          campaignId,
          customerId: customer.id,
          channel: 'SMS',
          message
        }).catch(err => {
          console.error(`Failed channel dispatch for ${customer.id}`);
        })
      ));
      
      // Yield to the event loop so the server remains responsive
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  } catch (error) {
    console.error('Error dispatching campaign communications:', error);
  }
}

app.get('/api/campaigns', async (req, res) => {
  const campaigns = await prisma.campaign.findMany({
    include: {
      segment: true,
      communications: true
    },
    orderBy: { createdAt: 'desc' }
  });
  
  // Attach stats
  const withStats = campaigns.map(camp => {
    const total = camp.communications.length;
    const delivered = camp.communications.filter(c => c.status === 'DELIVERED').length;
    const failed = camp.communications.filter(c => c.status === 'FAILED').length;
    const opened = camp.communications.filter(c => c.status === 'OPENED').length;
    const clicked = camp.communications.filter(c => c.status === 'CLICKED').length;
    
    // Determine status
    let status = camp.status;
    if (total > 0 && (delivered + failed) === total) {
      status = 'COMPLETED';
    }

    return { ...camp, stats: { total, delivered, failed, opened, clicked }, status };
  });

  res.json(withStats);
});

app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// --- POST-MORTEM AI INSIGHTS ---
app.get('/api/campaigns/:id/insights', async (req, res) => {
  const { id } = req.params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { communications: true, segment: true }
  });

  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  try {
    await new Promise(resolve => setTimeout(resolve, 800)); // Mock AI Delay
    const insights = "The campaign performed exceptionally well with high delivery rates. Click-through rates indicate strong engagement. Next step: Target non-openers with a different incentive.";
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// --- WEBHOOK RECEIPT (Called by Channel Service) ---
const webhookQueue: any[] = [];
let isProcessingQueue = false;

async function processWebhookQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (webhookQueue.length > 0) {
    const payload = webhookQueue.shift();
    if (!payload) continue;

    try {
      // Find the latest communication log for this campaign and customer
      const log = await prisma.communicationLog.findFirst({
        where: { campaignId: payload.campaignId, customerId: payload.customerId },
        orderBy: { timestamp: 'desc' }
      });

      if (log) {
        await prisma.communicationLog.update({
          where: { id: log.id },
          data: { status: payload.status, updatedAt: new Date() }
        });
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
    }
  }

  isProcessingQueue = false;
}

app.post('/api/webhooks/receipt', (req, res) => {
  const { campaignId, customerId, status } = req.body;
  
  if (!campaignId || !customerId || !status) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  // Push to queue and process sequentially to protect SQLite from concurrent write locks
  webhookQueue.push({ campaignId, customerId, status });
  processWebhookQueue();

  res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`CRM Core Backend listening on port ${PORT}`);
});
