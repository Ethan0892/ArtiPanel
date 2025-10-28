/**
 * Database Models Index
 * Exports all models with relationships
 */

import User from './User';
import Node from './Node';
import Server from './Server';
import GameServer from './GameServer';
import File from './File';
import Monitoring from './Monitoring';
import Backup from './Backup';

/**
 * Define Model Relationships
 */
export function initializeAssociations() {
  // User has many Servers
  User.hasMany(Server, {
    foreignKey: 'userId',
    as: 'servers',
  });
  Server.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // User has many GameServers
  User.hasMany(GameServer, {
    foreignKey: 'userId',
    as: 'gameServers',
  });
  GameServer.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  });

  // Node has many Servers
  Node.hasMany(Server, {
    foreignKey: 'nodeId',
    as: 'servers',
  });
  Server.belongsTo(Node, {
    foreignKey: 'nodeId',
    as: 'node',
  });

  // Node has many GameServers
  Node.hasMany(GameServer, {
    foreignKey: 'nodeId',
    as: 'gameServers',
  });
  GameServer.belongsTo(Node, {
    foreignKey: 'nodeId',
    as: 'node',
  });

  // Server has many GameServers
  Server.hasMany(GameServer, {
    foreignKey: 'serverId',
    as: 'gameServers',
  });
  GameServer.belongsTo(Server, {
    foreignKey: 'serverId',
    as: 'server',
  });

  // Server has many Files
  Server.hasMany(File, {
    foreignKey: 'serverId',
    as: 'files',
  });
  File.belongsTo(Server, {
    foreignKey: 'serverId',
    as: 'server',
  });

  // Server has many Monitoring records
  Server.hasMany(Monitoring, {
    foreignKey: 'serverId',
    as: 'monitoring',
  });
  Monitoring.belongsTo(Server, {
    foreignKey: 'serverId',
    as: 'server',
  });

  // Server has many Backups
  Server.hasMany(Backup, {
    foreignKey: 'serverId',
    as: 'backups',
  });
  Backup.belongsTo(Server, {
    foreignKey: 'serverId',
    as: 'server',
  });
}

export { User, Node, Server, GameServer, File, Monitoring, Backup };
export default {
  User,
  Node,
  Server,
  GameServer,
  File,
  Monitoring,
  Backup,
  initializeAssociations,
};
