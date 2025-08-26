import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Sample GET route
app.get('/', (_, res) => {
  res.send('✅ Express server is running!');
});

// Sample POST route
app.post('/echo', (req, res) => {
  const body = req.body;
  console.log('Received POST body:', body);
  res.json({
    message: 'Data received!',
    data: body,
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
