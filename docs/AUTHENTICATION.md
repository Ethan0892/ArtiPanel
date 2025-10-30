# ArtiPanel Authentication & Authorization

Complete guide to ArtiPanel's authentication system, user management, and security practices.

## Table of Contents

1. [Overview](#overview)
2. [First-User Admin Setup](#first-user-admin-setup)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Login & Session Management](#login--session-management)
5. [User Management](#user-management)
6. [API Authentication](#api-authentication)
7. [Security Best Practices](#security-best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

ArtiPanel uses a **Pterodactyl-inspired authentication system** with the following characteristics:

- **First-User Auto-Admin**: The first user to create an account automatically becomes an admin
- **Role-Based Access Control**: Three roles with different permissions
- **JWT Token Authentication**: Secure token-based API authentication
- **Session Persistence**: Automatic login restoration via tokens
- **Password Security**: PBKDF2 hashing with 100,000 iterations

### Key Concepts

| Term | Definition |
|------|-----------|
| **Admin** | Full system access, user management, all features |
| **User** | Standard user with limited access to assigned resources |
| **Viewer** | Read-only access, cannot modify anything |
| **Access Token** | Short-lived JWT (24 hours) used for API requests |
| **Refresh Token** | Long-lived JWT (7 days) used to get new access tokens |

---

## First-User Admin Setup

### What Happens on First Launch

1. **System Detection**: ArtiPanel checks if any admin user exists
2. **Initialization Page**: If no admin, user sees the **"Create Admin Account"** form
3. **Admin Account Creation**: User enters:
   - **Username**: Unique identifier (alphanumeric, no spaces)
   - **Email**: Valid email address
   - **Password**: Minimum 8 characters, must match confirmation
4. **Auto-Admin Assignment**: First user is automatically assigned **Admin** role
5. **Session Started**: User is logged in immediately after account creation
6. **System Initialized**: ArtiPanel is now ready for use

### First-User Setup Form

The setup page shows a Pterodactyl-inspired interface with:

```
┌─────────────────────────────────────┐
│         ArtiPanel                   │
│    Create Admin Account             │
├─────────────────────────────────────┤
│                                     │
│  Email Address    [____________]    │
│                                     │
│  Username         [____________]    │
│                                     │
│  Password         [____________]    │
│  (8+ characters)                    │
│                                     │
│  Confirm Password [____________]    │
│                                     │
│  [ Create Admin ]                   │
│                                     │
│  Set up your admin account to       │
│  initialize ArtiPanel. You'll be    │
│  able to manage users and settings  │
│  after login.                       │
│                                     │
└─────────────────────────────────────┘
```

### Requirements for First-User Account

- **Username**: 3-32 characters, alphanumeric + underscore/hyphen
- **Email**: Valid email format (contains @)
- **Password**: Minimum 8 characters, no maximum (reasonable limit ~256)
- **Confirmation**: Passwords must match exactly
- **Strength**: While not enforced, recommend 12+ chars with mixed case/numbers/symbols

### Example Setup Sequence

```bash
# Access ArtiPanel in browser
# http://localhost:3000

# See "Create Admin Account" form

# Fill in form:
- Email: admin@company.com
- Username: admin
- Password: MySecureP@ssw0rd
- Confirm Password: MySecureP@ssw0rd

# Click "Create Admin"

# ✅ Account created, logged in automatically
# 🎉 Ready to manage users and servers
```

---

## User Roles & Permissions

### Role Hierarchy

```
┌──────────────────────────────────────────┐
│ Admin (Full Access)                      │
│ ├─ Manage all users (create/edit/delete) │
│ ├─ Assign and change user roles          │
│ ├─ Access all system settings            │
│ ├─ View all servers and resources        │
│ └─ Manage system-wide policies           │
├──────────────────────────────────────────┤
│ User (Standard Access)                   │
│ ├─ Access assigned servers               │
│ ├─ View personal settings                │
│ ├─ Cannot modify other users             │
│ ├─ Cannot change their own role          │
│ └─ Limited system settings access        │
├──────────────────────────────────────────┤
│ Viewer (Read-Only Access)                │
│ ├─ View assigned servers                 │
│ ├─ View monitoring dashboards            │
│ ├─ Cannot modify anything                │
│ ├─ Cannot access settings                │
│ └─ Read-only resource access             │
└──────────────────────────────────────────┘
```

### Permission Matrix

| Feature | Admin | User | Viewer |
|---------|-------|------|--------|
| **User Management** | ✅ | ❌ | ❌ |
| Create Users | ✅ | ❌ | ❌ |
| Edit Users | ✅ | ❌ | ❌ |
| Delete Users | ✅ | ❌ | ❌ |
| Assign Roles | ✅ | ❌ | ❌ |
| **Server Management** | ✅ | ✅* | ❌ |
| Create Server | ✅ | ✅* | ❌ |
| Modify Server | ✅ | ✅* | ❌ |
| Delete Server | ✅ | ✅* | ❌ |
| **Monitoring** | ✅ | ✅ | ✅ |
| View Dashboards | ✅ | ✅ | ✅ |
| View Resources | ✅ | ✅ | ✅ |
| **Settings** | ✅ | ⚠️ | ❌ |
| System Settings | ✅ | ❌ | ❌ |
| Personal Settings | ✅ | ✅ | ❌ |

*User permissions depend on resource assignment

---

## Login & Session Management

### Login Flow

1. **User visits `/` or `/login`**
2. **System checks existing session** (localStorage tokens)
3. **If valid tokens exist**: Automatically logged in (no login page shown)
4. **If no tokens**: Login form appears
5. **User enters credentials** (username + password)
6. **Backend validates** and returns tokens
7. **Tokens stored** in localStorage
8. **Redirect to dashboard** (/)

### How Sessions Work

**On Browser Load:**
```typescript
// AuthContext checks for existing session
useEffect(() => {
  const checkStatus = async () => {
    // Check /api/auth/status to see if admin exists
    // Try to restore tokens from localStorage
    // Verify tokens are still valid
  };
}, []);
```

**Token Storage (localStorage):**
```json
{
  "artipanel_access_token": "eyJhbGc...",      // 24-hour token
  "artipanel_refresh_token": "eyJhbGc...",     // 7-day token
  "artipanel_user": {
    "id": "user-123",
    "username": "admin",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

**Session Persistence:**
- User closes browser? → Tokens remain in localStorage
- Browser crashes? → Tokens survive
- Page refresh? → Automatic login via stored tokens
- Access token expires? → Refresh token generates new access token
- Logout? → All tokens cleared

### Session Timeout

| Token Type | Lifetime | Purpose |
|-----------|----------|---------|
| Access Token | 24 hours | Make API requests |
| Refresh Token | 7 days | Get new access tokens |

**What happens when tokens expire:**
- **Access Token expires** → System automatically uses refresh token
- **Refresh Token expires** → User must login again
- **Server detects expired token** → Returns 401, triggers re-login

---

## User Management

### Admin User Management Dashboard

Access the Users Management page at `/users` (Admin only)

**Features:**
- ✅ View all users with details
- ✅ Create new users with roles
- ✅ Change user roles
- ✅ View user last-login timestamp
- ✅ Deactivate users
- ✅ Delete users

### Create New User (Admin Only)

**Method 1: Via Dashboard UI**
1. Navigate to **Users** page (`/users`)
2. Scroll to **Create New User** section
3. Fill in:
   - **Email**: User's email address
   - **Username**: Unique identifier
   - **Password**: Initial password (user can change later)
   - **Role**: Select role (admin, user, viewer)
4. Click **Create User**
5. ✅ User account created, ready to login

**Method 2: Via API**
```bash
curl -X POST http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@company.com",
    "password": "SecureP@ss123",
    "role": "user"
  }'
```

### Change User Role (Admin Only)

**Via Dashboard:**
1. Find user in Users table
2. Click role dropdown
3. Select new role (admin/user/viewer)
4. ✅ Role updated immediately

**Via API:**
```bash
curl -X PUT http://localhost:4000/api/admin/users/user-123/role \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "role": "admin" }'
```

### Delete User (Admin Only)

**Via Dashboard:**
1. Find user in Users table
2. Click **Delete** button
3. Confirm deletion
4. ✅ User account removed

**Via API:**
```bash
curl -X DELETE http://localhost:4000/api/admin/users/user-123 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Note**: Admins cannot delete themselves (prevents lockout)

### Deactivate User (Admin Only)

**Via API:**
```bash
curl -X PUT http://localhost:4000/api/admin/users/user-123/deactivate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Deactivated users cannot login but account is preserved.

---

## API Authentication

### Making Authenticated Requests

All API requests to protected endpoints require a valid **Access Token**

**Header Format:**
```
Authorization: Bearer <access_token>
```

**Example Request:**
```bash
curl -X GET http://localhost:4000/api/admin/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Public Endpoints (No Auth Required)

```
GET  /api/auth/status         # Check if admin exists
POST /api/auth/register       # Create first admin user
POST /api/auth/login          # Login with credentials
POST /api/auth/refresh        # Get new access token
POST /api/auth/logout         # Clear session
```

### Protected Endpoints (Require Auth)

```
GET    /api/admin/users              # List all users
POST   /api/admin/users              # Create user
PUT    /api/admin/users/:id/role     # Change user role
DELETE /api/admin/users/:id          # Delete user
PUT    /api/admin/users/:id/deactivate # Deactivate user
```

### Token Refresh Flow

```
1. Access token nearing expiry (or already expired)
2. Client calls POST /api/auth/refresh with refresh token
3. Server validates refresh token
4. Server returns new access token (if refresh token still valid)
5. Client uses new access token for requests
6. When refresh token expires → User must login again
```

**Example Refresh:**
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

---

## Security Best Practices

### Password Security

1. **Strong Passwords**: Use 12+ characters with mixed case, numbers, symbols
2. **Unique Passwords**: Never reuse passwords across services
3. **Password Manager**: Recommend 1Password, Bitwarden, KeePass
4. **Regular Changes**: Consider changing passwords quarterly
5. **No Sharing**: Never share your password with anyone

### Token Security

1. **Never commit tokens**: Don't add tokens to git/version control
2. **Use HTTPS only**: Always use https:// in production (tokens visible to networks)
3. **Secure storage**: localStorage is secure for single-user browsers
4. **Token rotation**: Regular token refresh minimizes exposure window
5. **Monitor activity**: Review login history regularly

### Admin Security

1. **Strong admin password**: Extra-strong password for first admin account
2. **Limited admins**: Only make necessary users admins
3. **Separate accounts**: Use user account for daily work, admin only for management
4. **API keys (future)**: Use API keys instead of passwords for automation
5. **Audit logging (planned)**: Monitor admin actions

### Rate Limiting

ArtiPanel includes built-in rate limiting:

```
Unauthenticated: 100 requests per 15 minutes
Authenticated:   500 requests per 15 minutes
```

**Exceeded limits?**
- Response: HTTP 429 (Too Many Requests)
- Wait 15 minutes, then retry
- Check for suspicious activity

### Network Security

1. **VPN/Firewall**: Only expose ArtiPanel on private networks
2. **HTTPS Required**: Enable SSL/TLS in production
3. **Network Segmentation**: Isolate panel on secure network segment
4. **DDoS Protection**: Use Cloudflare, AWS Shield, or similar
5. **Fail2Ban**: Monitor logs and ban repeat offenders

### Data Security

1. **Encryption at Rest**: Database passwords encrypted
2. **Encryption in Transit**: All data encrypted with HTTPS
3. **Backups**: Regular encrypted backups of user data
4. **Access Control**: Only admins can export/view sensitive data
5. **Compliance**: GDPR and HIPAA ready (in progress)

---

## Troubleshooting

### Cannot Access Login Page

**Problem**: Stuck on loading screen or stuck on Create Admin form

**Solutions**:
1. Clear browser cache
2. Open in private/incognito window
3. Try different browser
4. Check network tab in DevTools (any errors?)

**Debug**:
```bash
# Check if backend is running
curl http://localhost:4000/api/auth/status

# Check browser console for errors (F12 > Console)
# Check browser network tab (F12 > Network)
```

### Forgot Admin Password

**Problem**: Admin password lost or forgotten

**Solutions**:
1. Delete `storage/users.json` (resets system)
2. Restart ArtiPanel
3. Re-run first-user setup
4. **WARNING**: This deletes all users!

**For production databases**:
```sql
-- If using PostgreSQL, reset first user
UPDATE users SET password_hash = NULL WHERE id = (
  SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1
);
```

Then restart and re-run first-user setup.

### Cannot Login (Wrong Credentials)

**Problem**: Login fails with "Invalid username or password"

**Check**:
1. Verify username is spelled correctly
2. Verify Caps Lock is off
3. Try the password reset (feature coming soon)
4. Contact admin to reset password

### Token Expired While Working

**Problem**: Getting 401 "Unauthorized" or token errors

**Automatic Fix**:
- ArtiPanel automatically refreshes tokens
- If refresh token also expired, you'll be logged out
- Just login again

**Manual Fix**:
```javascript
// In browser console:
localStorage.removeItem('artipanel_access_token');
localStorage.removeItem('artipanel_refresh_token');
// Then reload page and login again
```

### Admin User Management Not Working

**Problem**: Users page shows "Access Denied"

**Causes**:
1. You're not an admin (check profile)
2. Your session expired (logout and login again)
3. Role didn't save correctly

**Fix**:
1. Logout: Click logout button
2. Login: Use admin credentials
3. Try again

### Multiple Admin Accounts

**Can I have multiple admins?**
Yes! After first admin is created:
1. Go to Users page
2. Create new user
3. Set role to "admin"
4. New user can manage other users

**Best practice**: Have 2-3 admins for redundancy

### Session Not Persisting

**Problem**: Getting logged out after page refresh

**Causes**:
1. Browser privacy/incognito mode doesn't persist storage
2. localStorage disabled in browser settings
3. Browser cookies cleared
4. Tokens expired

**Fix**:
1. Check if private/incognito mode → use normal window
2. Check browser settings → enable cookies & storage
3. Re-login and check token expiry

**Debug in Console**:
```javascript
// Check if tokens exist:
localStorage.getItem('artipanel_access_token');
localStorage.getItem('artipanel_refresh_token');

// Check if they're still valid (base64 decode and check exp field)
// Tokens expire after: access 24h, refresh 7d
```

---

## Advanced Topics

### JWT Token Structure

ArtiPanel uses **HS256** signed JWT tokens.

**Token payload contains**:
```json
{
  "userId": "user-123",
  "username": "admin",
  "role": "admin",
  "type": "access",    // or "refresh"
  "iat": 1730000000,   // issued at
  "exp": 1730086400    // expiration (24h later)
}
```

**Decode token** (for debugging):
1. Go to [jwt.io](https://jwt.io)
2. Paste token in "Encoded" box
3. See decoded payload

⚠️ **Security Note**: JWT tokens are signed but NOT encrypted. Never put sensitive data in tokens!

### Password Hashing

Passwords are hashed using **PBKDF2** with:
- **Algorithm**: SHA-256
- **Iterations**: 100,000
- **Salt**: Randomly generated per user
- **Output**: 64-byte hash

**Example hashed password**:
```
$2025$PBKDF2$SHA256$100000$somerandomsalt$veryverylonghashhere
```

This means:
- Even admins cannot see actual passwords
- If database is compromised, passwords are still secure
- Passwords cannot be recovered (only reset)

---

## Future Security Features

Planned for upcoming releases:

- [ ] Two-Factor Authentication (2FA) via TOTP
- [ ] Password reset via email
- [ ] API keys for automation
- [ ] Audit logging (all admin actions)
- [ ] Session management (kill sessions remotely)
- [ ] IP whitelisting
- [ ] Single Sign-On (SSO) integration
- [ ] OAuth2 support
- [ ] Security keys (WebAuthn)

---

## Need Help?

- 📖 **Documentation**: See other docs in `/docs/`
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/Ethan0892/ArtiPanel/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Ethan0892/ArtiPanel/discussions)
- 🤝 **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md)

