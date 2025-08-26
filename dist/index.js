"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const emailService_1 = require("./emailService");
// Initialize the MCP Server
const server = new mcp_js_1.McpServer({
    name: 'mcp-send-email',
    version: '1.0.0',
});
// Define the send-email tool with Zod validation
server.tool('send-email', 'Send an email using the configured email service (Gmail in this case)', {
    to: zod_1.z.string().email().describe('Recipient email address'),
    subject: zod_1.z.string().describe('Subject of the email'),
    text: zod_1.z.string().describe('Plain text email content'),
    html: zod_1.z.string().optional().describe('Optional HTML email content'),
}, (_a) => __awaiter(void 0, [_a], void 0, function* ({ to, subject, text, html }) {
    try {
        console.log('Received MCP request:', { to, subject, text, html });
        const result = yield (0, emailService_1.sendEmail)(to, subject, text);
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
    }
    catch (error) {
        console.error('Error sending email via MCP:', error);
        throw new Error('Failed to send email');
    }
}));
// Start the MCP server
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Connecting to MCP transport...');
            const transport = new stdio_js_1.StdioServerTransport();
            yield server.connect(transport);
            console.log('MCP server connected to transport');
            console.log('MCP Send Email service running on stdio');
        }
        catch (error) {
            console.error('Failed to start MCP server:', error);
            throw error;
        }
    });
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
