import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
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

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
