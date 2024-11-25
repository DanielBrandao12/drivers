import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database';

import Driver from './drivers'; 



interface IReviewAttributes {
    id: number;
    rating: number;
    r_comment: string | null;
    driver_id: number;
  }
  
  class Review extends Model<IReviewAttributes> implements IReviewAttributes {
    public id!: number;
    public rating!: number;
    public r_comment!: string | null;
    public driver_id!: number;
  

  }
  
  Review.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      r_comment: {
        type: DataTypes.TEXT,
        allowNull: true, // Comentário pode ser nulo
      },
      driver_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Review',
      tableName: 'reviews',
      timestamps: false,
    }
  );
  
  Review.belongsTo(Driver, { foreignKey: 'driver_id' });

  export default Review;