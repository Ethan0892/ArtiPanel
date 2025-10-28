/**
 * Monitoring Model
 * Records system metrics for servers
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface MonitoringAttributes {
  id: string;
  serverId: string;
  timestamp: Date;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  status: 'online' | 'offline' | 'warning' | 'critical';
  createdAt?: Date;
}

interface MonitoringCreationAttributes extends Optional<MonitoringAttributes, 'id' | 'createdAt'> {}

export class Monitoring extends Model<MonitoringAttributes, MonitoringCreationAttributes> implements MonitoringAttributes {
  public id!: string;
  public serverId!: string;
  public timestamp!: Date;
  public cpuUsage!: number;
  public memoryUsage!: number;
  public diskUsage!: number;
  public networkIn!: number;
  public networkOut!: number;
  public status!: 'online' | 'offline' | 'warning' | 'critical';
  public readonly createdAt!: Date;
}

Monitoring.init(
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
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    cpuUsage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    memoryUsage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    diskUsage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
    },
    networkIn: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    networkOut: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'warning', 'critical'),
      defaultValue: 'online',
    },
  },
  {
    sequelize,
    tableName: 'monitoring',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false,
    indexes: [
      { fields: ['serverId'] },
      { fields: ['timestamp'] },
      { fields: ['status'] },
    ],
  }
);

export default Monitoring;
