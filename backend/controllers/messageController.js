import { Chat, Message, User } from '../models/index.js';

class MessageController {
    // Get all messages for a chat
    static async getChatMessages(req, res) {
        try {
            const { chatId } = req.params;
            const userId = req.user.id;
            
            // Check if the chat exists and belongs to the user
            const chat = await Chat.findOne({
                where: { id: chatId, userId }
            });
            
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
            
            // Validate request
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message content is required'
                });
            }
            
            // Check if the chat exists and belongs to the user
            const chat = await Chat.findOne({
                where: { id: chatId, userId }
            });
            
            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to access it'
                });
            }
            
            // Create the user message
            const userMessage = await Message.create({
                content: message,
                chatId,
                senderId: userId,
                isUserMessage: true
            });
            
            // Simple AI response - In a real app, this would call an AI service
            const aiMessage = await Message.create({
                content: `You said: "${message}". This is an AI response.`,
                chatId,
                senderId: userId, // Using the user ID as we don't have a separate AI user
                isUserMessage: false
            });
            
            // Return the AI message in the expected format
            return res.status(201).json({
                id: aiMessage.id.toString(),
                chatId: aiMessage.chatId.toString(),
                message: aiMessage.content,
                sender: 'system',
                createdAt: aiMessage.createdAt
            });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: error.message
            });
        }
    }
}

export default MessageController; 