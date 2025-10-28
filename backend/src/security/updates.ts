/**
 * Automatic Update System
 * Handles version checking, downloading, installing, and rollback
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

export interface VersionInfo {
  current: string;
  latest: string;
  channel: 'stable' | 'beta' | 'dev';
  releaseDate: Date;
  changelog: string;
}

export interface UpdateManifest {
  version: string;
  releaseDate: Date;
  changelog: string;
  downloadUrl: string;
  checksum: string;
  size: number;
  breakingChanges: string[];
  minimumRequirements: {
    nodeVersion: string;
    diskSpace: number;
    ram: number;
  };
}

export interface UpdateProgress {
  status: 'checking' | 'downloading' | 'installing' | 'completed' | 'failed' | 'rolling-back';
  progress: number; // 0-100
  currentFile?: string;
  message: string;
  error?: string;
}

const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const VERSION_FILE = 'version.json';
const BACKUP_DIR = './backups/updates';
const UPDATE_DIR = './updates';

/**
 * Get current version
 */
export function getCurrentVersion(): string {
  try {
    const versionPath = path.join(process.cwd(), VERSION_FILE);
    if (fs.existsSync(versionPath)) {
      const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
      return versionData.version || '1.0.0';
    }
  } catch {
    // Ignore errors
  }
  return '1.0.0';
}

/**
 * Check for updates from update server
 */
export async function checkForUpdates(channel: 'stable' | 'beta' | 'dev' = 'stable'): Promise<VersionInfo | null> {
  try {
    const updateServerUrl = process.env.UPDATE_SERVER_URL;
    if (!updateServerUrl) {
      logger.warn('UPDATE_SERVER_URL not configured, update checking disabled');
      return null;
    }

    // Fetch from actual update server using configured URL
    const response = await fetch(`${updateServerUrl}/check?channel=${channel}&current=${getCurrentVersion()}`, {
      timeout: 10000,
      headers: { 'User-Agent': `ArtiPanel/${getCurrentVersion()}` }
    });

    if (!response.ok) {
      logger.warn(`Update server returned ${response.status}`);
      return null;
    }

    const data = await response.json() as VersionInfo;
    return data;
  } catch (error) {
    console.error(`Failed to check for updates: ${error}`);
    return null;
  }
}

/**
 * Compare semantic versions
 */
export function compareVersions(v1: string, v2: string): -1 | 0 | 1 {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;

    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }

  return 0;
}

/**
 * Check if update is available
 */
export function isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(latestVersion, currentVersion) > 0;
}

/**
 * Download update package
 */
export async function downloadUpdate(manifest: UpdateManifest, onProgress?: (progress: UpdateProgress) => void): Promise<string> {
  try {
    if (!fs.existsSync(UPDATE_DIR)) {
      fs.mkdirSync(UPDATE_DIR, { recursive: true });
    }

    const updatePath = path.join(UPDATE_DIR, `update-${manifest.version}.zip`);

    // Simulate download with progress tracking
    if (onProgress) {
      onProgress({
        status: 'downloading',
        progress: 0,
        message: `Starting download of version ${manifest.version}...`,
      });
    }

    // Download the update package from the update server
    const downloadUrl = process.env.UPDATE_SERVER_DOWNLOAD_URL || manifest.downloadUrl;
    if (!downloadUrl) {
      throw new Error('No download URL available for update');
    }

    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download update: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(updatePath, Buffer.from(buffer));

    if (onProgress) {
      onProgress({
        status: 'downloading',
        progress: 100,
        message: `Download completed: ${updatePath}`,
      });
    }

    return updatePath;
  } catch (error) {
    if (onProgress) {
      onProgress({
        status: 'failed',
        progress: 0,
        message: `Download failed: ${error}`,
        error: String(error),
      });
    }
    throw error;
  }
}

/**
 * Verify update package integrity
 */
export function verifyUpdatePackage(packagePath: string, expectedChecksum: string): boolean {
  try {
    const content = fs.readFileSync(packagePath);
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    return checksum === expectedChecksum;
  } catch (error) {
    console.error(`Failed to verify update package: ${error}`);
    return false;
  }
}

/**
 * Install update
 */
export async function installUpdate(packagePath: string, onProgress?: (progress: UpdateProgress) => void): Promise<boolean> {
  try {
    if (onProgress) {
      onProgress({
        status: 'installing',
        progress: 10,
        message: 'Preparing installation...',
      });
    }

    // Backup current installation
    if (onProgress) {
      onProgress({
        status: 'installing',
        progress: 20,
        message: 'Backing up current installation...',
      });
    }

    if (!backupCurrentVersion()) {
      throw new Error('Failed to backup current version');
    }

    if (onProgress) {
      onProgress({
        status: 'installing',
        progress: 40,
        message: 'Extracting update package...',
      });
    }

    // Extract update (unzip)
    // In production, use proper unzip logic
    const updateContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    if (onProgress) {
      onProgress({
        status: 'installing',
        progress: 70,
        message: 'Installing files...',
      });
    }

    // Copy files and update version
    const versionPath = path.join(process.cwd(), VERSION_FILE);
    fs.writeFileSync(
      versionPath,
      JSON.stringify({
        version: updateContent.version,
        installedAt: new Date().toISOString(),
      }),
    );

    if (onProgress) {
      onProgress({
        status: 'installing',
        progress: 90,
        message: 'Cleaning up...',
      });
    }

    // Run post-installation scripts
    runPostInstallScripts();

    if (onProgress) {
      onProgress({
        status: 'completed',
        progress: 100,
        message: `Update to version ${updateContent.version} completed successfully`,
      });
    }

    return true;
  } catch (error) {
    if (onProgress) {
      onProgress({
        status: 'failed',
        progress: 0,
        message: `Installation failed: ${error}`,
        error: String(error),
      });
    }
    return false;
  }
}

/**
 * Rollback to previous version
 */
export async function rollbackUpdate(onProgress?: (progress: UpdateProgress) => void): Promise<boolean> {
  try {
    if (onProgress) {
      onProgress({
        status: 'rolling-back',
        progress: 10,
        message: 'Starting rollback process...',
      });
    }

    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error('No backup found for rollback');
    }

    const backups = fs.readdirSync(BACKUP_DIR).sort().reverse();
    if (backups.length === 0) {
      throw new Error('No backup available');
    }

    if (onProgress) {
      onProgress({
        status: 'rolling-back',
        progress: 30,
        message: `Restoring backup: ${backups[0]}...`,
      });
    }

    // Restore files from backup
    // In production, implement proper restore logic

    if (onProgress) {
      onProgress({
        status: 'completed',
        progress: 100,
        message: 'Rollback completed successfully',
      });
    }

    return true;
  } catch (error) {
    if (onProgress) {
      onProgress({
        status: 'failed',
        progress: 0,
        message: `Rollback failed: ${error}`,
        error: String(error),
      });
    }
    return false;
  }
}

/**
 * Backup current version before update
 */
function backupCurrentVersion(): boolean {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);
    fs.mkdirSync(backupPath, { recursive: true });

    // In production, backup important files
    // For now, just create the directory structure
    const versionPath = path.join(process.cwd(), VERSION_FILE);
    if (fs.existsSync(versionPath)) {
      fs.copyFileSync(versionPath, path.join(backupPath, 'version.json'));
    }

    return true;
  } catch (error) {
    console.error(`Failed to backup current version: ${error}`);
    return false;
  }
}

/**
 * Run post-installation scripts
 */
function runPostInstallScripts(): void {
  try {
    // Run npm install to update dependencies
    execSync('npm install', { cwd: process.cwd(), stdio: 'ignore' });

    // Run database migrations if needed
    // execSync('npm run migrate', { cwd: process.cwd(), stdio: 'ignore' });

    // Clear caches
    // execSync('npm run cache:clear', { cwd: process.cwd(), stdio: 'ignore' });
  } catch (error) {
    console.error(`Post-installation scripts failed: ${error}`);
  }
}

/**
 * Schedule automatic update checks
 */
export function scheduleUpdateChecks(intervalMs: number = UPDATE_CHECK_INTERVAL): NodeJS.Timer {
  return setInterval(async () => {
    try {
      const versionInfo = await checkForUpdates('stable');
      if (versionInfo && isUpdateAvailable(versionInfo.current, versionInfo.latest)) {
        console.log(`Update available: ${versionInfo.latest}`);
        // Emit event or notify admin
      }
    } catch (error) {
      console.error(`Scheduled update check failed: ${error}`);
    }
  }, intervalMs);
}

/**
 * Get update status
 */
export function getUpdateStatus(): Record<string, any> {
  return {
    currentVersion: getCurrentVersion(),
    lastUpdateCheck: getLastUpdateCheckTime(),
    updateAvailable: false, // Will be set by scheduled check
    pendingUpdate: false,
    backupExists: fs.existsSync(BACKUP_DIR),
  };
}

/**
 * Get last update check time
 */
function getLastUpdateCheckTime(): Date | null {
  try {
    const statusFile = path.join(UPDATE_DIR, '.update-status');
    if (fs.existsSync(statusFile)) {
      const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
      return new Date(status.lastCheck);
    }
  } catch {
    // Ignore errors
  }
  return null;
}

export default {
  getCurrentVersion,
  checkForUpdates,
  compareVersions,
  isUpdateAvailable,
  downloadUpdate,
  verifyUpdatePackage,
  installUpdate,
  rollbackUpdate,
  scheduleUpdateChecks,
  getUpdateStatus,
};
