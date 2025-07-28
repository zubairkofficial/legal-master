import { DataTypes, Model } from 'sequelize';

export default function initTransactionHistoryModel(sequelize) {
  class TransactionHistory extends Model {}

  TransactionHistory.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      planId: { type: DataTypes.INTEGER, allowNull: true },
      stripePaymentIntentId: { type: DataTypes.STRING, allowNull: true },
      amount: { type: DataTypes.FLOAT, allowNull: false },
      currency: { type: DataTypes.STRING, allowNull: false, defaultValue: 'usd' },
      status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'succeeded' },
      description: { type: DataTypes.STRING, allowNull: true },
      paymentMethod: { type: DataTypes.STRING, allowNull: true },
      cardBrand: { type: DataTypes.STRING, allowNull: true },    
      cardLast4: { type: DataTypes.STRING, allowNull: true },     
      transactionDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    },
    {
      sequelize,
      modelName: 'TransactionHistory',
      tableName: 'transaction_history',
      paranoid: true,
    }
  );

  return TransactionHistory;
}
