/**
 * Node Model
 * Represents distributed game server nodes (like Pterodactyl nodes)
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface NodeAttributes {
  id: string;
  name: string;
  description?: string;
  location: string;
  fqdn: string;
  scheme: 'http' | 'https';
  port: number;
  apiKey: string;
  memory: number;
  memoryOverallocate: number;
  disk: number;
  diskOverallocate: number;
  cpuLimit: number;
  maxServers: number;
  status: 'online' | 'offline' | 'maintenance';
  lastStatusCheck?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NodeCreationAttributes extends Optional<NodeAttributes, 'id' | 'lastStatusCheck' | 'createdAt' | 'updatedAt'> {}

export class Node extends Model<NodeAttributes, NodeCreationAttributes> implements NodeAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public location!: string;
  public fqdn!: string;
  public scheme!: 'http' | 'https';
  public port!: number;
  public apiKey!: string;
  public memory!: number;
  public memoryOverallocate!: number;
  public disk!: number;
  public diskOverallocate!: number;
  public cpuLimit!: number;
  public maxServers!: number;
  public status!: 'online' | 'offline' | 'maintenance';
  public lastStatusCheck?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  /**
   * Get node URL
   */
  getUrl(): string {
    return `${this.scheme}://${this.fqdn}:${this.port}`;
  }

  /**
   * Get available resources
   */
  getAvailableResources(usedMemory: number, usedDisk: number) {
    const maxMemory = this.memory + (this.memory * this.memoryOverallocate) / 100;
    const maxDisk = this.disk + (this.disk * this.diskOverallocate) / 100;

    return {
      availableMemory: maxMemory - usedMemory,
      availableDisk: maxDisk - usedDisk,
      totalMemory: maxMemory,
      totalDisk: maxDisk,
      memoryPercent: (usedMemory / maxMemory) * 100,
      diskPercent: (usedDisk / maxDisk) * 100,
    };
  }
}

Node.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fqdn: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    scheme: {
      type: DataTypes.ENUM('http', 'https'),
      defaultValue: 'https',
    },
    port: {
      type: DataTypes.INTEGER,
      defaultValue: 8080,
    },
    apiKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    memory: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total memory in MB',
    },
    memoryOverallocate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Overallocation percentage',
    },
    disk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total disk in MB',
    },
    diskOverallocate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Overallocation percentage',
    },
    cpuLimit: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'CPU limit percentage (0 = unlimited)',
    },
    maxServers: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'maintenance'),
      defaultValue: 'offline',
    },
    lastStatusCheck: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'nodes',
    timestamps: true,
    indexes: [
      { fields: ['status'] },
      { fields: ['location'] },
      { fields: ['fqdn'] },
    ],
  }
);

export default Node;
