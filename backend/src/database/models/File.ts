/**
 * File Model
 * Represents files managed within servers
 */

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../index';

interface FileAttributes {
  id: string;
  serverId: string;
  path: string;
  name: string;
  size: number;
  mimeType: string;
  isDirectory: boolean;
  permissions: string;
  owner?: string;
  lastModified?: Date;
  content?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface FileCreationAttributes extends Optional<FileAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  public id!: string;
  public serverId!: string;
  public path!: string;
  public name!: string;
  public size!: number;
  public mimeType!: string;
  public isDirectory!: boolean;
  public permissions!: string;
  public owner?: string;
  public lastModified?: Date;
  public content?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

File.init(
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
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    size: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    mimeType: {
      type: DataTypes.STRING,
      defaultValue: 'text/plain',
    },
    isDirectory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    permissions: {
      type: DataTypes.STRING,
      defaultValue: '644',
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastModified: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'files',
    timestamps: true,
    indexes: [
      { fields: ['serverId'] },
      { fields: ['path'] },
      { fields: ['isDirectory'] },
    ],
  }
);

export default File;
