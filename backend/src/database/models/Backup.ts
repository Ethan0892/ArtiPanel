/**
 * Backup Model
 * Records server backups
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface BackupAttributes {
  id: string;
  serverId: string;
  name: string;
  size: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  storageLocation: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BackupCreationAttributes extends Optional<BackupAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Backup extends Model<BackupAttributes, BackupCreationAttributes> implements BackupAttributes {
  public id!: string;
  public serverId!: string;
  public name!: string;
  public size!: number;
  public status!: 'pending' | 'in_progress' | 'completed' | 'failed';
  public storageLocation!: string;
  public notes?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Backup.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'servers',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    storageLocation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'backups',
    timestamps: true,
    indexes: [
      { fields: ['serverId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] },
    ],
  }
);

export default Backup;
