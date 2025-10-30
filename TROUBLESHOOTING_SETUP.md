# Troubleshooting: Fresh Installation Setup Issues

## Problem

When starting ArtiPanel from scratch (fresh installation), you see a **login page** instead of the **admin setup page**, even though no users have been created yet.

## Why This Happens

This is a known issue that occurs in certain scenarios:

1. **Fresh Installation**: Users file doesn't exist or is empty
2. **Corrupted Users File**: The `storage/users.json` file exists but is invalid
3. **Backend Service Issue**: The backend isn't running or `/api/auth/status` endpoint is failing
4. **Browser Cache**: Old session data is cached locally

## Quick Fixes (Try These First)

### Fix 1: Clear Browser Storage
The simplest and most effective solution:

1. **Open DevTools**: Press `F12` or right-click → "Inspect"
2. **Go to Application Tab**: Click the "Application" tab
3. **Clear Storage**:
   - Find "Local Storage" → `http://localhost:5173` (or your domain)
   - Delete all items
   - Also check "Session Storage" and delete everything
4. **Close DevTools** and refresh the page (`Ctrl+R` or `Cmd+R`)

**Expected Result**: Should now show the admin setup page

### Fix 2: Hard Refresh Browser Cache
Sometimes browser cache causes issues:

- **Windows/Linux**: `Ctrl+Shift+R` 
- **Mac**: `Cmd+Shift+R`

This forces the browser to download fresh files from the server.

### Fix 3: Verify Backend is Running
Ensure the backend server is actually running:

```powershell
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Test the backend directly:
```powershell
# PowerShell - Test if backend is responding
Invoke-WebRequest -Uri "http://localhost:4000/api/auth/status" -UseBasicParsing
```

**Expected Response**:
```json
{
  "initialized": false,
  "requiresSetup": true
}
```

If you get an error, the backend isn't responding. Make sure it's running on port 4000.

### Fix 4: Delete and Recreate Users File
If the users file is corrupted:

```powershell
# Stop the backend first!

# Navigate to the backend directory
cd backend

# Delete the corrupted users file
Remove-Item -Path "storage/users.json" -Force -ErrorAction SilentlyContinue

# Create a new empty storage directory (if needed)
New-Item -ItemType Directory -Path "storage" -Force

# Restart backend
npm run dev
```

Then refresh the browser and you should see the setup page.

### Fix 5: Complete Clean Start
If nothing else works, do a complete reset:

```powershell
# Stop all running processes

# Delete storage directory
Remove-Item -Path "backend/storage" -Recurse -Force -ErrorAction SilentlyContinue

# Clear browser storage (see Fix 1)

# Restart backend
cd backend
npm run dev

# In another terminal, restart frontend
cd frontend
npm run dev
```

## Step-by-Step: Getting to Setup When Stuck on Login

**When you're stuck on the login page and need to get to setup:**

### Method 1: Browser Console (Fastest)

1. Open DevTools: `F12`
2. Go to **Console** tab
3. Paste this code:
   ```javascript
   // Clear all auth tokens from localStorage
   localStorage.removeItem('artipanel-access-token');
   localStorage.removeItem('artipanel-refresh-token');
   localStorage.removeItem('artipanel-user');
   
   // Refresh the page
   location.reload();
   ```
4. Press Enter
5. The page will refresh and show the setup page

### Method 2: Storage Tab (Visual)

1. Open DevTools: `F12`
2. Click **Application** tab
3. In left sidebar: **Local Storage** → `http://localhost:5173`
4. Right-click each item and delete:
   - `artipanel-access-token`
   - `artipanel-refresh-token`
   - `artipanel-user`
5. Refresh page with `F5`

### Method 3: Delete Users File (Nuclear Option)

If browser fixes don't work, delete the users data file:

```powershell
# Make sure backend is STOPPED first
# Then delete the users file
Remove-Item -Path "backend/storage/users.json" -Force -ErrorAction SilentlyContinue

# Restart backend
cd backend
npm run dev

# Refresh browser
```

## Verification Checklist

After trying these fixes, verify each step:

- [ ] Backend is running on port 4000
- [ ] Frontend is running on port 5173
- [ ] Browser shows setup page (not login)
- [ ] Setup form has fields for Email, Username, Password
- [ ] Can enter credentials and submit
- [ ] Success message appears
- [ ] Redirected to dashboard

## Still Not Working?

If you're still seeing the login page after trying all fixes:

### Check Backend Logs

Look at the backend terminal output for errors:
```
[error] message here
```

### Check Browser Console

Press `F12` → **Console** tab and look for red error messages.

### Verify Storage Directory

Check if the storage directory exists:
```powershell
# Check if storage directory and file exist
Get-Item -Path "backend/storage" -ErrorAction SilentlyContinue
Get-Item -Path "backend/storage/users.json" -ErrorAction SilentlyContinue

# If not created, create it manually
New-Item -ItemType Directory -Path "backend/storage" -Force
```

### Check users.json Format

If the file exists, view its contents:
```powershell
# View the users file
Get-Content -Path "backend/storage/users.json" -Raw

# It should be empty {} or contain:
# {"users":[],"lastModified":"..."}

# If corrupted, delete and recreate:
Remove-Item -Path "backend/storage/users.json" -Force
```

## Understanding the Issue

The `/api/auth/status` endpoint checks if any users exist:

- **If users exist**: `requiresSetup: false` → Shows login page
- **If NO users**: `requiresSetup: true` → Shows setup page

The bug occurred when this logic was checking only for admin users instead of any users. This is now fixed in the latest version, but might occur if:

1. You're using an older version
2. The users file is corrupted
3. Browser cache has old token data
4. Backend isn't running

## Prevention

To prevent this issue in the future:

1. **Always clear browser storage** after pulling code updates
2. **Keep backend and frontend running** during development
3. **Don't share localStorage** between multiple sessions
4. **Use incognito/private mode** to test fresh installations

## If Issue Persists

If you're still having issues after all these steps:

1. **Check the GitHub Issues**: https://github.com/Ethan0892/ArtiPanel/issues
2. **Create a new issue** with:
   - Screenshot of the problem
   - Backend logs (last 50 lines)
   - Browser console errors (if any)
   - Steps to reproduce
   - Your OS and Node version

## Automated Fix Script

Save this as `fix-setup.ps1` and run it when stuck:

```powershell
# Fix ArtiPanel Fresh Installation Issues

Write-Host "ArtiPanel Setup Fix" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green

# Step 1: Stop backend if running
Write-Host "`n1. Stopping backend service..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Delete storage
Write-Host "2. Clearing storage directory..." -ForegroundColor Yellow
Remove-Item -Path "backend/storage" -Recurse -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Step 3: Create fresh storage
Write-Host "3. Creating fresh storage directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "backend/storage" -Force | Out-Null

# Step 4: Instructions
Write-Host "4. Ready to start fresh!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. Open DevTools (F12) in your browser"
Write-Host "  2. Go to Application > Local Storage"
Write-Host "  3. Delete all artipanel-* items"
Write-Host "  4. Refresh the page (F5)"
Write-Host "  5. You should now see the setup page"
Write-Host "`nThen restart the servers:" -ForegroundColor Cyan
Write-Host "  Terminal 1: cd backend && npm run dev"
Write-Host "  Terminal 2: cd frontend && npm run dev"
```

Run with:
```powershell
.\fix-setup.ps1
```

---

**Last Updated**: October 30, 2025  
**Version**: 0.1.0-alpha.1  
**Status**: Known Issue (Being Fixed)
