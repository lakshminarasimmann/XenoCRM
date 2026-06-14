console.log("HELLO FROM INDEX.TS");
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const ai = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
    // We use Gemini to translate natural language into Prisma WHERE clause
    const aiResponse = await ai.generateContent(`You are an expert data analyst. Based on the following user prompt, generate a valid JSON object that represents a Prisma WHERE clause for the Customer model. Only return the JSON, nothing else.\n\nPrompt: "${prompt}"`);

    let prismaWhere = {};
    try {
      const responseText = aiResponse.response.text()?.trim() || '{}';
      // Remove any markdown formatting if the model still includes it
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '');
      prismaWhere = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse.response.text());
      return res.status(500).json({ error: 'AI failed to generate a valid segment filter' });
    }

    // Evaluate the size of the segment
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

// --- AI VALIDATION & SIMULATION ---
app.post('/api/campaigns/validate', async (req, res) => {
  const { messageTemplate } = req.body;
  if (!messageTemplate) return res.status(400).json({ error: 'messageTemplate required' });

  try {
    const aiResponse = await ai.generateContent(`You are an expert marketer and compliance officer. Analyze the following SMS/Email template for spam risk and effectiveness. Return ONLY a valid JSON object with:
- "status": A string that is either "PASS", "WARNING", or "FAIL". Use "FAIL" if it contains highly spammy/illegal phrasing (like "URGENT!! YOU WON MONEY").
- "explanations": An array of strings explaining why you gave this status.

Template: "${messageTemplate}"`);

    const responseText = aiResponse.response.text()?.trim() || '{}';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '');
    const result = JSON.parse(cleanJson);
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Failed to validate campaign' });
  }
});

app.post('/api/campaigns/simulate', async (req, res) => {
  const { messageTemplate, segmentId } = req.body;
  if (!messageTemplate || !segmentId) return res.status(400).json({ error: 'messageTemplate and segmentId required' });

  try {
    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    const aiResponse = await ai.generateContent(`You are an expert marketer. Simulate the outcome of the following campaign. Return ONLY a valid JSON object with the exact following fields:
- "deliveryProbability": A percentage string (e.g. "98.5%")
- "openRate": A percentage string
- "ctr": A percentage string (click-through rate)
- "spamProbability": A number out of 100 representing spam likelihood
- "recommendedTime": A string of the best time to send (e.g. "Tomorrow, 10:00 AM")
- "fatigueScore": A number out of 10 indicating audience fatigue
- "explanations": An array of 3 strings explaining these predictions.

Segment size: ${segment?.size || 0}
Template: "${messageTemplate}"`);

    const responseText = aiResponse.response.text()?.trim() || '{}';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '');
    const result = JSON.parse(cleanJson);
    res.json(result);
  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ error: 'Failed to simulate campaign' });
  }
});

// --- CAMPAIGNS ---
app.post('/api/campaigns/draft', async (req, res) => {
  const { segmentId, prompt } = req.body;
  if (!segmentId || !prompt) return res.status(400).json({ error: 'segmentId and prompt required' });

  try {
    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
    const aiResponse = await ai.generateContent(`You are an expert copywriter. Generate 3 variants of short, punchy marketing messages (SMS style, max 160 chars) based on the prompt.\n\nPrompt: "${prompt}"\n\nReturn ONLY a JSON array of strings.`);
    
    const responseText = aiResponse.response.text()?.trim() || '[]';
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '');
    const variants = JSON.parse(cleanJson);
    res.json({ variants });
  } catch (error) {
    console.error('Draft error:', error);
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
      const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
      const aiResponse = await ai.generateContent(`You are an expert copywriter. Generate ONE short, punchy marketing message (SMS style, max 160 chars) based on this prompt: "${prompt}". Return ONLY the message text without quotes.`);
      finalMessage = aiResponse.response.text()?.trim();
    } catch (e) {
      console.error('AI message generation failed', e);
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

    for (const customer of customers) {
      // Log as pending
      await prisma.communicationLog.create({
        data: {
          campaignId,
          customerId: customer.id,
          status: 'PENDING'
        }
      });

      // Call the external Channel Service
      try {
        await axios.post(CHANNEL_SERVICE_URL, {
          campaignId,
          customerId: customer.id,
          channel: 'SMS',
          message
        });
      } catch (err: any) {
        console.error(`Failed to dispatch to channel service for customer ${customer.id}:`, err.message);
      }
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

// --- POST-MORTEM AI INSIGHTS ---
app.get('/api/campaigns/:id/insights', async (req, res) => {
  const { id } = req.params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: { communications: true, segment: true }
  });

  if (!campaign) return res.status(404).json({ error: 'Campaign not found' });

  const total = campaign.communications.length;
  const delivered = campaign.communications.filter(c => c.status === 'DELIVERED').length;
  const failed = campaign.communications.filter(c => c.status === 'FAILED').length;
  const opened = campaign.communications.filter(c => c.status === 'OPENED').length;
  const clicked = campaign.communications.filter(c => c.status === 'CLICKED').length;

  try {
    const aiResponse = await ai.generateContent(`You are a data analyst. Review this campaign performance:\nSent: ${total}\nDelivered: ${delivered}\nFailed: ${failed}\nOpened: ${opened}\nClicked: ${clicked}\n\nProvide a 2-3 sentence insight on what happened and what to do next.`);

    res.json({ insights: aiResponse.response.text()?.trim() });
  } catch (error) {
    console.error('Insights generation error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// --- WEBHOOK RECEIPT (Called by Channel Service) ---
app.post('/api/webhooks/receipt', async (req, res) => {
  const { campaignId, customerId, status } = req.body;
  
  if (!campaignId || !customerId || !status) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  try {
    // Find the latest communication log for this campaign and customer
    const log = await prisma.communicationLog.findFirst({
      where: { campaignId, customerId },
      orderBy: { timestamp: 'desc' }
    });

    if (log) {
      await prisma.communicationLog.update({
        where: { id: log.id },
        data: { status, updatedAt: new Date() }
      });
    }
    
    // Also update campaign status if all are completed
    // (This is a simplified check, in a real system we'd use a background job)

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`CRM Core Backend listening on port ${PORT}`);
});
