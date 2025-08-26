import express from 'express';
import { spawn } from 'child_process';
import { sendEmail } from './emailService';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    service: 'MCP Send Email Service',
    status: 'running',
    endpoints: {
      POST: '/send-email - Send an email'
    }
  });
});

app.post('/send-email', async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({
      error: 'Missing required fields: to, subject, text'
    });
  }

  try {
    const result = await sendEmail(to, subject, text);
    res.json({
      success: true,
      message: `Email sent successfully to ${to}`
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email'
    });
  }
});

app.listen(PORT, () => {
  console.log(`HTTP wrapper server listening on port ${PORT}`);
});