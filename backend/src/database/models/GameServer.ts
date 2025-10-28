/**
 * GameServer Model
 * Represents game servers deployed on nodes
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface GameServerAttributes {
  id: string;
  userId: string;
  nodeId: string;
  serverId: string;
  name: string;
  game: string;
  version: string;
  maxPlayers: number;
  motd?: string;
  port: number;
  queryPort?: number;
  rconPort?: number;
  rconPassword?: string;
  status: 'running' | 'stopped' | 'restarting' | 'installing' | 'error';
  modpack?: string;
  plugins: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface GameServerCreationAttributes extends Optional<GameServerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class GameServer extends Model<GameServerAttributes, GameServerCreationAttributes> implements GameServerAttributes {
  public id!: string;
  public userId!: string;
  public nodeId!: string;
  public serverId!: string;
  public name!: string;
  public game!: string;
  public version!: string;
  public maxPlayers!: number;
  public motd?: string;
  public port!: number;
  public queryPort?: number;
  public rconPort?: number;
  public rconPassword?: string;
  public status!: 'running' | 'stopped' | 'restarting' | 'installing' | 'error';
  public modpack?: string;
  public plugins!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

GameServer.init(
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
    game: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    maxPlayers: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
    },
    motd: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    queryPort: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rconPort: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    rconPassword: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('running', 'stopped', 'restarting', 'installing', 'error'),
      defaultValue: 'stopped',
    },
    modpack: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    plugins: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'game_servers',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['nodeId'] },
      { fields: ['serverId'] },
      { fields: ['game'] },
      { fields: ['status'] },
    ],
  }
);

export default GameServer;
