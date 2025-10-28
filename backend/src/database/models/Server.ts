/**
 * Server Model
 * Represents virtual servers managed in the panel
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface ServerAttributes {
  id: string;
  userId: string;
  nodeId: string;
  name: string;
  description?: string;
  image: string;
  cpu: number;
  memory: number;
  disk: number;
  ports: string[];
  status: 'running' | 'stopped' | 'restarting' | 'installing' | 'error';
  type: 'vps' | 'game' | 'web' | 'database' | 'storage' | 'monitoring';
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServerCreationAttributes extends Optional<ServerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class Server extends Model<ServerAttributes, ServerCreationAttributes> implements ServerAttributes {
  public id!: string;
  public userId!: string;
  public nodeId!: string;
  public name!: string;
  public description?: string;
  public image!: string;
  public cpu!: number;
  public memory!: number;
  public disk!: number;
  public ports!: string[];
  public status!: 'running' | 'stopped' | 'restarting' | 'installing' | 'error';
  public type!: 'vps' | 'game' | 'web' | 'database' | 'storage' | 'monitoring';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Server.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    nodeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'nodes',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpu: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'CPU cores/percentage',
    },
    memory: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Memory in MB',
    },
    disk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Disk space in MB',
    },
    ports: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    status: {
      type: DataTypes.ENUM('running', 'stopped', 'restarting', 'installing', 'error'),
      defaultValue: 'stopped',
    },
    type: {
      type: DataTypes.ENUM('vps', 'game', 'web', 'database', 'storage', 'monitoring'),
      defaultValue: 'vps',
    },
  },
  {
    sequelize,
    tableName: 'servers',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['nodeId'] },
      { fields: ['status'] },
      { fields: ['type'] },
    ],
  }
);

export default Server;
