import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface IUserAttributes {
  id: number;
  u_name: string;
}

interface IUserCreationAttributes {
  u_name: string;
}

class User extends Model<IUserAttributes, IUserCreationAttributes> implements IUserAttributes {
  public id!: number;
  public u_name!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    u_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
  }
);

export default User;
