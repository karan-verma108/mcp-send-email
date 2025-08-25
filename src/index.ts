import express from 'express';
import * as dotenv from 'dotenv';
import { sendEmail } from './googleOAuth';

dotenv.config();

const app = express();
app.use(express.json());
const port = 3000;

// Endpoint to send email
app.post('/send-email', async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    const result = await sendEmail(to, subject, body);
    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
