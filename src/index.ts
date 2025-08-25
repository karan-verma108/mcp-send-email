import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import express from 'express';
import { sendEmail } from './emailService';

// Initialize the MCP Server
const server = new McpServer({
  name: 'mcp-send-email',
  version: '1.0.0',
});

// Define the send-email tool with Zod validation
server.tool(
  'send-email',
  'Send an email using the configured email service (Gmail in this case)',
  {
    to: z.string().email().describe('Recipient email address'),
    subject: z.string().describe('Subject of the email'),
    text: z.string().describe('Plain text email content'),
    html: z.string().optional().describe('Optional HTML email content'),
  },
  async ({ to, subject, text, html }) => {
    try {
      console.log('Received MCP request:', { to, subject, text, html });
      const result = await sendEmail(to, subject, text);
      if (html) {
        console.log('HTML content provided:', html);
      }
      return {
        content: [
          {
            type: 'text',
            text: `Email sent successfully to ${to}`,
          },
        ],
      };
    } catch (error) {
      console.error('Error sending email via MCP:', error);
      throw new Error('Failed to send email');
    }
  }
);

// HTTP Server for testing with Postman
const app = express();
app.use(express.json());

// Send email endpoint for Postman testing
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;
    
    // Validate input using the same Zod schema as MCP tool
    const schema = z.object({
      to: z.string().email('Invalid email address'),
      subject: z.string().min(1, 'Subject is required'),
      text: z.string().min(1, 'Text content is required'),
      html: z.string().optional(),
    });
    
    const validated = schema.parse({ to, subject, text, html });
    console.log('Received HTTP request:', validated);
    
    // Call the same function as the MCP tool
    const result = await sendEmail(validated.to, validated.subject, validated.text);
    
    res.json({
      success: true,
      message: `Email sent successfully to ${validated.to}`,
      result,
    });
  } catch (error) {
    console.error('HTTP endpoint error:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

// Start HTTP server for testing
const PORT = process.env.PORT || 3000;

if (process.env.MCP_ONLY !== 'true') {
  app.listen(PORT, () => {
    console.log(`HTTP server running on port ${PORT}`);
    console.log(`Test endpoint: POST http://localhost:${PORT}/send-email`);
  });
}

// Start the MCP server
async function main() {
  try {
    console.log('Connecting to MCP transport...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log('MCP server connected to transport');
    console.log('MCP Send Email service running on stdio');
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    throw error;
  }
}

// Start the server
main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});