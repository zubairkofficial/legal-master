import { Chat, Message, User } from '../models/index.js';
import { Op } from 'sequelize';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class ChatController {
    // Create a new chat
    static async createChat(req, res) {
        try {
            const { title = "Chat" } = req.body;
            const userId = req.user.id; // Assuming authentication middleware sets req.user

            // Validate required fields
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Chat title is required'
                });
            }

            const metadata = {
                ...req.body,
                legalQuestions: req.body.legalQuestionnaire,
                questionResponses: req.body.questionResponses,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant."
                    }
                ]
            })


            const chat = await Chat.create({
                title,
                metadata,
                userId
            });

            // Create an initial welcome message from AI
            await Message.create({
                content: response.choices[0].message.content,
                chatId: chat.id,
                senderId: userId, // Using the same user ID since it's system-generated
                isUserMessage: false, // Mark as not a user message (AI message)
            });

            return res.status(201).json({
                content: response.choices[0].message.content,
                success: true,
                data: chat,
                message: 'Chat created successfully'
            });
        } catch (error) {
            console.error('Error creating chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create chat',
                error: error.message
            });
        }
    }

    // Get all chats for the current user
    static async getAllChats(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;
            let where
            // Build filter conditions
            if (req.user.role === 'admin') {
                where = {};
            } else {
                where = { userId: req.user.id };
            }
            if (search) {
                where.title = { [Op.iLike]: `%${search}%` };
            }

            const chats = await Chat.findAll({
                where: where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Message,
                        as: 'messages',
                        separate: true,
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: chats,
                pagination: {
                    total: chats.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(chats.count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching chats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve chats',
                error: error.message
            });
        }
    }

    // Get all chats for the current user
    static async getChatHistory(req, res) {
        try {
            const userId = req.user.id; // Assuming authentication middleware sets req.user
            const { page = 1, limit = 10, search } = req.query;
            const offset = (page - 1) * limit;

            // Build filter conditions
            const where = { userId };
            if (search) {
                where.title = { [Op.iLike]: `%${search}%` };
            }

            const chats = await Chat.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset: parseInt(offset),
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'name', 'email']
                    },
                    {
                        model: Message,
                        as: 'messages',
                        separate: true,
                        limit: 1,
                        order: [['createdAt', 'DESC']]
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            return res.status(200).json({
                success: true,
                data: chats.rows,
                pagination: {
                    total: chats.count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(chats.count / limit)
                }
            });
        } catch (error) {
            console.error('Error fetching chats:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve chats',
                error: error.message
            });
        }
    }


    // Get a single chat by ID with messages
    static async getChatById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // Assuming authentication middleware sets req.user

            const chat = await Chat.findOne({
                where: { id, userId },
                include: [
                    {
                        model: Message,
                        as: 'messages',
                        order: [['createdAt', 'ASC']]
                    }
                ]
            });

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to access it'
                });
            }

            return res.status(200).json({
                success: true,
                data: chat
            });
        } catch (error) {
            console.error('Error fetching chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to retrieve chat',
                error: error.message
            });
        }
    }

    // Rename a chat
    static async renameChat(req, res) {
        try {
            const { id } = req.params;
            const { title } = req.body;
            const userId = req.user.id; // Assuming authentication middleware sets req.user

            // Validate required fields
            if (!title) {
                return res.status(400).json({
                    success: false,
                    message: 'Chat title is required'
                });
            }

            const chat = await Chat.findOne({
                where: { id, userId }
            });

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to modify it'
                });
            }

            // Update chat title
            await chat.update({ title });

            return res.status(200).json({
                success: true,
                data: chat,
                message: 'Chat renamed successfully'
            });
        } catch (error) {
            console.error('Error renaming chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to rename chat',
                error: error.message
            });
        }
    }

    // Delete a chat
    static async deleteChat(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id; // Assuming authentication middleware sets req.user

            const chat = await Chat.findOne({
                where: { id, userId }
            });

            if (!chat) {
                return res.status(404).json({
                    success: false,
                    message: 'Chat not found or you do not have permission to delete it'
                });
            }

            // Delete the chat (using soft delete since paranoid is true in the model)
            await chat.destroy();

            return res.status(200).json({
                success: true,
                message: 'Chat deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting chat:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete chat',
                error: error.message
            });
        }
    }
}

export default ChatController;
