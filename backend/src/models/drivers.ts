import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

interface IDriverAttributes {
  id: number;
  m_name: string;
  m_drescription: string;
  vehicle: string;
  tax_km: number;
  km_min: number;
}



class Driver extends Model<IDriverAttributes> implements IDriverAttributes {
  public id!: number;
  public m_name!: string;
  public m_drescription!: string;
  public vehicle!: string;
  public tax_km!: number;
  public km_min!: number;
}

Driver.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    m_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    m_drescription: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    vehicle: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tax_km: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    km_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  
  },
  {
    sequelize,
    modelName: 'Driver',
    tableName: 'drivers',
    timestamps: false,
  }
);

export default Driver;
