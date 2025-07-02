# 🔐 ALOT SuperAdmin System - Global Services Management

## Overview
The SuperAdmin system provides exclusive access to manage global services in the ALOT platform. This streamlined system focuses solely on adding and managing services that will be available to all barbershops.

## 🚀 Access Information

### SuperAdmin Credentials
- **URL**: `http://localhost:3000/superadmin/login`
- **Email**: `admin@alot.com`
- **Password**: `SuperSecure123!@`

### Security Features
- Environment-based credential storage
- Session timeout (1 hour)
- Failed login attempt tracking (max 3 attempts with reset option)
- Separate authentication system from regular users

## 📁 System Structure

```
src/app/superadmin/
├── layout.tsx              # SuperAdmin layout with authentication
├── page.tsx                # Global services management
└── login/
    └── page.tsx           # SuperAdmin login page

src/app/api/superadmin/
└── auth/
    └── route.ts           # Authentication endpoint
```

## 🛡️ Security Implementation

### Environment Variables
```env
SUPERADMIN_EMAIL=admin@alot.com
SUPERADMIN_PASSWORD=SuperSecure123!@
SUPERADMIN_SECRET_KEY=alot-superadmin-2024-secure-key-xyz789
SUPERADMIN_SESSION_TIMEOUT=3600000
SUPERADMIN_MAX_LOGIN_ATTEMPTS=3
```

### Authentication Flow
1. User enters credentials on `/superadmin/login`
2. Credentials verified against environment variables
3. Session token generated and stored in localStorage
4. All superadmin routes protected by layout authentication
5. Session expires after 1 hour of inactivity

### Route Protection
- Middleware protects all `/superadmin/*` routes
- Client-side authentication check in layout
- Automatic redirect to login if not authenticated
- Session expiry handling

## 📊 Features

### Global Services Management
- **Add Services**: Create new global services available to all barbershops
- **Service Details**: Manage service title and featured images
- **Image Upload**: Upload service images to Firebase Storage (`/services` directory)
- **Service Deletion**: Remove services with confirmation
- **Real-time Updates**: Instant updates to the services collection

### Service Data Structure
Each service in the `services` collection contains:
- **id**: Document ID stored as a field (same as document ID for easy fetching)
- **title**: Service name (e.g., "Haircuts", "Beard Trim")
- **featuredImage**: Image URL stored in Firebase Storage under `/services`

## 🔧 API Endpoints

### Authentication
- `POST /api/superadmin/auth` - Authenticate superadmin



## 🚀 Usage

1. Navigate to `/superadmin/login`
2. Enter superadmin credentials: `admin@alot.com` / `SuperSecure123!@`
3. Access the dashboard for global service management
4. Add new services with title and optional image
5. Manage existing services (view/delete)

## 🔒 Security Notes

- SuperAdmin credentials are stored in environment variables
- Session tokens are stored in localStorage
- All superadmin routes are protected by authentication middleware
- Failed login attempts are tracked and limited (with reset option)
- Sessions expire after 1 hour of inactivity
- Firebase Storage rules allow uploads to `/services` directory

## 📝 Development Notes

- The SuperAdmin system is completely separate from regular user authentication
- Uses environment-based credentials for maximum security
- Client-side session management with automatic expiry
- Direct Firebase Storage uploads to `/services` directory
- Streamlined interface focused solely on global service management

## 🔐 Credential Management

### Changing Credentials
To change superadmin credentials:
1. Update environment variables in `.env.local`
2. Restart the application
3. Clear browser localStorage
4. Log in with new credentials

### Security Best Practices
- Never commit credentials to version control
- Use strong, unique passwords
- Regularly rotate credentials
- Monitor access logs

---

**⚠️ IMPORTANT**: This is a restricted access system for global service management only.
