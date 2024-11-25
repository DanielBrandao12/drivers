import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database'; // Certifique-se de que o caminho do seu arquivo database está correto
import User from './users'; // Importando o modelo de User
import Driver from './drivers'; // Importando o modelo de Driver

interface IRideAttributes {
  id: number;
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  user_id: number;
  driver_id: number;
  r_value: number;
  r_date: Date;
}

class Ride extends Model<IRideAttributes> implements IRideAttributes {
  public id!: number;
  public origin!: string;
  public destination!: string;
  public distance!: number;
  public duration!: string;
  public user_id!: number;
  public driver_id!: number;
  public r_value!: number;
  public r_date!: Date;
}

// Definindo o modelo de Ride e seus atributos
Ride.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    distance: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    driver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    r_value: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    r_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Ride',
    tableName: 'rides',
    timestamps: false,
  }
);

// Definindo os relacionamentos (associando o modelo Ride com User e Driver)
Ride.belongsTo(User, { foreignKey: 'user_id' }); // Cada corrida pertence a um usuário
Ride.belongsTo(Driver, { foreignKey: 'driver_id' }); // Cada corrida pertence a um motorista

export default Ride;
