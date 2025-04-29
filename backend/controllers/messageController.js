import { Chat, Message, User, Settings } from '../models/index.js';
import { OpenAI } from 'openai';

class MessageController {
    // Get all messages for a chat
    static async getChatMessages(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            let chat;
            
            if (req.user.role === 'admin') {
                // Check if the chat exists and belongs to the user
                 chat = await Chat.findOne({
                    where: { id: chatId }
                });
            } else {
                // Check if the chat exists and belongs to the user
                 chat = await Chat.findOne({
                    where: { id: chatId, userId }
                });
            }
            
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to access it'
                });
            }
            
            // Get messages for the chat
            const messages = await Message.findAll({
                where: { chatId },
                order: [['createdAt', 'ASC']],
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
            
            // Transform messages to the expected format
            const formattedMessages = messages.map(message => ({
                id: message.id.toString(),
                chatId: message.chatId.toString(),
                message: message.content,
                sender: message.isUserMessage ? 'user' : 'system',
                createdAt: message.createdAt
            }));
            
            return res.status(200).json(formattedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve messages',
                error: error.message
            });
        }
    }
    
    // Send a new message
    static async sendMessage(req, res) {
        try {
            const { chatId } = req.params;
            const { message } = req.body;
            const userId = req.user.id;
            
            // Set SSE headers immediately
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();
            
            // Validate request
            if (!message) {
                res.write(`data: ${JSON.stringify({ error: 'Message content is required' })}\n\n`);
                res.end();
                return;
            }
            
            // Check if the chat exists and belongs to the user
            const chat = await Chat.findOne({
                where: { id: chatId, userId }
            });
            
            if (!chat) {
                res.write(`data: ${JSON.stringify({ error: 'Chat not found or you do not have permission to access it' })}\n\n`);
                res.end();
                return;
            }
            
            // Create the user message
            const userMessage = await Message.create({
                content: message,
                chatId,
                senderId: userId,
                isUserMessage: true
            });

            // Get the chat history for context
            const chatHistory = await Message.findAll({
                where: { chatId },
                order: [['createdAt', 'ASC']],
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });

            // Transform chat history to OpenAI message format
            const messages = chatHistory.map(msg => ({
                role: msg.isUserMessage ? 'user' : 'assistant',
                content: msg.content
            }));

            // Add the new user message to the context if it wasn't included in chatHistory
            const lastMessage = messages[messages.length - 1];
            if (!lastMessage || lastMessage.content !== message) {
                messages.push({ role: 'user', content: message });
            }

            // Get OpenAI settings
            const settings = await Settings.findOne({
                where: {
                    service: 'openai'
                }
            });

            const openai = new OpenAI({
                apiKey: settings.apiKey,
            });

            // Call OpenAI API with streaming enabled
            const response = await openai.chat.completions.create({
                model: settings.model || "gpt-4",
                messages: messages,
                stream: true,
            });

            let finalMessage = "";

            for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content || "";
                finalMessage += content;
                
                // Only send non-empty content
                if (content) {
                    res.write(`data: ${JSON.stringify({ content, id: chatId })}\n\n`);
                }
            }

            // Create the AI message in the database
            const aiMessage = await Message.create({
                content: finalMessage,
                chatId,
                senderId: userId,
                isUserMessage: false
            });

            res.end();
        } catch (error) {
            console.error('Error sending message:', error);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
}

export default MessageController; 