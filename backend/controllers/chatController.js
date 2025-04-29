import { Chat, Message, User, Settings } from '../models/index.js';
import { Op } from 'sequelize';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class ChatController {
    // Create a new chat - only creates chat in DB without streaming response
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
                legalQuestionnaire: req.body.legalQuestionnaire,
                questionResponses: req.body.questionResponses,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Create the chat in database
            const chat = await Chat.create({
                title,
                metadata,
                userId
            });

            // Return chat ID to client
            return res.status(201).json({
                success: true,
                data: { 
                    id: chat.id,
                    title: chat.title 
                },
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

    // Stream initial message for a chat
    static async streamInitialMessage(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Set up response headers for SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders();

            // Find the chat
            const chat = await Chat.findOne({
                where: { id, userId }
            });

            if (!chat) {
                res.write(`data: ${JSON.stringify({ error: 'Chat not found' })}\n\n`);
                return res.end();
            }

            const settings = await Settings.findOne({
                where: {
                    service: 'openai'
                }
            });

            const openai = new OpenAI({
                apiKey: settings.apiKey,
            });

            const metadata = chat.metadata;

            const systemPrompt = `You are a Virtual Legal Drafting Assistant trained to conduct role-specific legal questionnaires for users involved in civil or criminal cases in different jurisdictions. Your goal is to gather clear, complete, and relevant information based on the user's role (e.g., plaintiff or defendant), legal jurisdiction (country and province/state), and case description.

            In this session:
            - Jurisdiction: **${metadata.legalQuestionnaire?.country}**, Province: **${metadata.legalQuestionnaire?.province}**.
            - The user is acting as the **${metadata.legalQuestionnaire?.role}**.
            - Case Description: 
            "${metadata.legalQuestionnaire?.caseDescription}"
            
            \nThe Virtual Legal Drafting Assistant is an AI-powered entity utilizing the ChatGPT API, specifically designed to assist with various legal matters and legal document drafting. It serves as a reliable partner for legal professionals, offering expert guidance, generating legally sound content, and providing valuable insights in the field of law.
            \n\nResponsibilities:
            \n1. Legal Document Drafting: The Virtual Legal Drafting Assistant is proficient in drafting various legal documents, including contracts, agreements, wills, pleadings, and more. It can generate initial drafts based on user input or provide revisions to existing documents.
            \n2. Legal Research: The Assistant can conduct legal research by providing summaries of relevant laws, statutes, regulations, and case law. It can assist in analyzing legal precedents and offering insights into the implications of various legal issues.
            \n3. Contract Review and Analysis: It can review contracts and agreements to identify potential risks, ambiguities, or areas that require further clarification. The Assistant can suggest modifications and improvements to ensure legal compliance and protection.
            \n4. Legal Advice and Consultation: While it does not replace the role of a licensed attorney, the Virtual Legal Drafting Assistant can provide general legal information and guidance. It can help users understand legal concepts and provide direction on potential courses of action.
            \n5. Legal Language and Terminology: The Assistant is well-versed in legal language and terminology, ensuring that all generated content adheres to standard legal conventions and maintains accuracy and precision.
            \n6. Confidentiality and Security: It maintains strict confidentiality and data security standards to protect sensitive legal information provided by users.
            \n7. Continuous Learning: The Virtual Legal Drafting Assistant is continuously updated with the latest legal developments, ensuring that its responses are in line with current legal standards and regulations.
            \n\nLimitations:
            \n- The Virtual Legal Drafting Assistant is not a substitute for professional legal advice, and users should always consult with a qualified attorney for specific legal matters.
            \n- It does not possess the ability to provide legal opinions or make legal decisions.
            \n- Users are responsible for verifying the accuracy and validity of the information and documents generated by the Assistant.
            \n- If user query is irrelevent or from another subject Please mention that the question or query is irrelevent 
            `

            const response = await openai.chat.completions.create({
                model: settings.model,
                stream: true,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    }
                ]
            });

            let finalMessage = "";

            for await (const chunk of response) {
                const content = chunk.choices[0]?.delta?.content || "";
                finalMessage += content;

                // Make sure each chunk is a complete SSE message
                if (content) {
                    res.write(`data: ${JSON.stringify({ content, id: chat.id })}\n\n`);
                }
            }

            // Create an initial welcome message from AI
            await Message.create({
                content: finalMessage,
                chatId: chat.id,
                senderId: userId,
                isUserMessage: false, // AI message
            });

            res.end();
        } catch (error) {
            console.error('Error streaming initial message:', error);
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
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
