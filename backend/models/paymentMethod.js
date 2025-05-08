import { DataTypes, Model } from 'sequelize';

export default function initPaymentMethodModel(sequelize) {
    class PaymentMethod extends Model {}

    PaymentMethod.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            cardNumber: {
                type: DataTypes.STRING,
                allowNull: false
            },
            cardholderName: {
                type: DataTypes.STRING,
                allowNull: false
            },
            expiryMonth: {
                type: DataTypes.STRING(2),
                allowNull: false
            },
            expiryYear: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            cvc: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            billingAddress: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            isDefault: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
            lastFourDigits: {
                type: DataTypes.STRING(4),
                allowNull: false
            },
            cardType: {
                type: DataTypes.STRING,
                allowNull: true
            },
            status: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
        {
            sequelize,
            modelName: 'PaymentMethod',
            tableName: 'payment_methods',
            paranoid: true // Enable soft deletes
        }
    );

    // Define associations
    PaymentMethod.associate = (models) => {
        PaymentMethod.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
    };

    return PaymentMethod;
} 