import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import initUserModel from './user.js';
import initCategoryModel from './category.js';
import initQuestionModel from './question.js';
import initChatModel from './chat.js';
import initMessageModel from './message.js';
import initSettingsModel from './settings.js';

dotenv.config();

// Create a new Sequelize instance with database configurations
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    define: {
        logging: false,
        timestamps: true,
    },
});

// Initialize models
const User = initUserModel(sequelize);
const Category = initCategoryModel(sequelize);
const Question = initQuestionModel(sequelize);
const Chat = initChatModel(sequelize);
const Message = initMessageModel(sequelize);
const Settings = initSettingsModel(sequelize);

// Define associations

// User associations
User.hasMany(Chat, {
    foreignKey: 'userId',
    as: 'chats',
});

User.hasMany(Message, {
    foreignKey: 'senderId',
    as: 'messages',
});

// Category associations
Category.hasMany(Question, {
    foreignKey: 'categoryId',
    as: 'questions',
});

// Question associations
Question.belongsTo(Category, {
    foreignKey: 'categoryId',
    as: 'category',
});

// Chat associations
Chat.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

Chat.hasMany(Message, {
    foreignKey: 'chatId',
    as: 'messages',
});

// Message associations
Message.belongsTo(Chat, {
    foreignKey: 'chatId',
    as: 'chat',
});

Message.belongsTo(User, {
    foreignKey: 'senderId',
    as: 'sender',
});

// Export models and sequelize instance
export { sequelize, User, Category, Question, Chat, Message, Settings };
export default sequelize;
