import { Router } from 'express';

const router = Router();

/**
 * Remote Access Endpoints (VNC, RDP, SSH Terminal)
 */

router.get('/console/:serverId', (_req, res) => {
  res.json({ message: 'Get console endpoint', consoleUrl: 'vnc://...' });
});

router.post('/console/:serverId/session', (_req, res) => {
  res.json({ message: 'Create console session endpoint', sessionId: 'sess_xxx' });
});

router.get('/terminal/:serverId', (_req, res) => {
  res.json({ message: 'Get terminal endpoint', terminalUrl: 'ws://...' });
});

router.post('/terminal/:serverId/command', (_req, res) => {
  res.json({ message: 'Execute terminal command endpoint' });
});

router.post('/file/:serverId/upload', (_req, res) => {
  res.json({ message: 'File upload endpoint' });
});

router.get('/file/:serverId/download', (_req, res) => {
  res.json({ message: 'File download endpoint' });
});

router.get('/file/:serverId/browse', (_req, res) => {
  res.json({ message: 'File browser endpoint', files: [] });
});

router.post('/wol/:serverId', (_req, res) => {
  res.json({ message: 'Wake-on-LAN endpoint' });
});

router.post('/vpn/connect/:serverId', (_req, res) => {
  res.json({ message: 'VPN connect endpoint' });
});

export default router;
