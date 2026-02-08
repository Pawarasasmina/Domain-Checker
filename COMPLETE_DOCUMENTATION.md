# Domain Management Dashboard - Complete Documentation

**Version:** 1.0.0  
**Date:** February 8, 2026  
**Author:** Port City Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Features](#features)
4. [System Architecture](#system-architecture)
5. [Technology Stack](#technology-stack)
6. [Installation Guide](#installation-guide)
7. [Configuration](#configuration)
8. [User Roles & Permissions](#user-roles--permissions)
9. [API Documentation](#api-documentation)
10. [User Interface Guide](#user-interface-guide)
11. [Database Schema](#database-schema)
12. [Security Features](#security-features)
13. [Real-time Features](#real-time-features)
14. [Troubleshooting](#troubleshooting)
15. [Maintenance & Updates](#maintenance--updates)

---

## Executive Summary

The Domain Management Dashboard is a comprehensive MERN stack application designed to manage and monitor domain portfolios with real-time Nawala blocking status checks. The system provides role-based access control, bulk operations, CSV import/export functionality, and integration with external domain checking APIs.

### Key Capabilities

- **Domain Management**: Create, read, update, delete (CRUD) operations for domains
- **Brand Management**: Organize domains by brand/category
- **Real-time Monitoring**: Automatic domain status checking via Nawala API
- **Bulk Operations**: Import/export via CSV, bulk delete blocked domains
- **Role-Based Access**: Three-tier permission system (Admin, Manager, User)
- **Manual Checker**: On-demand checking of up to 5 domains
- **Live Statistics**: Real-time dashboard with domain health metrics

---

## System Overview

### Purpose

This system enables organizations to:
- Monitor domain availability and blocking status in Indonesia
- Manage large domain portfolios efficiently
- Track domain categorization by brands
- Control user access through role-based permissions
- Perform bulk operations on domain data

### Target Users

- **Administrators**: Full system access, user management
- **Managers**: Domain and brand management capabilities
- **Users**: Read-only access to view domain information

---

## Features

### 1. Domain Management

#### Core Features
- Add new domains with validation (supports paths like `domain.com/path`)
- Edit existing domain information
- Delete individual domains with confirmation
- View domain list with pagination (50 per page)
- Search and filter domains
- CSV export of all domains (unlimited)

#### Domain Attributes
- **Domain Name**: The actual domain URL (e.g., `example.com/path`)
- **Brand**: Associated brand category
- **Status**: Active, Blocked, or Unknown
- **Uptime Status**: Uptime monitoring badge (Unknown/Active/Inactive)
- **Cloudflare Status**: Cloudflare proxy status badge
- **Nawala Status**: Indonesian web filtering status (Ada/Tidak Ada)
- **Notes**: Additional information or remarks
- **Timestamps**: Created and updated dates

#### Bulk Operations
- **CSV Import**: Upload CSV files with multiple domains (tested with 266+ records)
- **CSV Export**: Download complete domain list as CSV file
- **Bulk Delete Blocked**: Remove all blocked domains with confirmation

### 2. Brand Management

- Create, edit, and delete brand categories
- Assign domains to specific brands
- View domains grouped by brand
- Brand-based filtering and organization

### 3. User Management (Admin Only)

- Create new user accounts
- Edit user information and roles
- View user list with role badges
- Delete user accounts
- Email validation (accepts any valid email format)

### 4. Manual Domain Checker

- Check up to 5 domains simultaneously
- Real-time status verification via API
- Results display:
  - **"Ada"** (Blocked) - Red badge with ❌ icon
  - **"Tidak Ada"** (Accessible) - Green badge with ✅ icon
- Response time metrics
- Confidence level indicators
- Summary statistics

### 5. Dashboard & Analytics

- **Total Domains**: Complete domain count
- **Active Brands**: Number of brand categories
- **Blocked Domains**: Count of blocked domains
- **Total Users**: System user count
- Real-time updates via Socket.IO

### 6. Authentication & Security

- JWT-based authentication
- Secure password hashing with bcrypt
- Role-based route protection
- Session management
- CORS protection
- Helmet security headers
- Rate limiting

---

## System Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  (React 18 + Vite, Tailwind CSS, React Router v6)      │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             │ HTTP/HTTPS                 │ WebSocket
             │ (REST API)                 │ (Socket.IO)
             │                            │
┌────────────▼────────────────────────────▼───────────────┐
│                   APPLICATION LAYER                      │
│         (Node.js + Express.js + Socket.IO)              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Auth       │  │   Domain     │  │   Brand      │ │
│  │   Routes     │  │   Routes     │  │   Routes     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Middleware  │  │  Validation  │  │  Socket.IO   │ │
│  │  (Auth/RBAC) │  │  Rules       │  │  Events      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────┬────────────────────────────┬───────────────┘
             │                            │
             │ Mongoose ODM               │ Real-time Events
             │                            │
┌────────────▼────────────────────────────▼───────────────┐
│                    DATABASE LAYER                        │
│           (MongoDB Atlas - Cloud Database)               │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Users      │  │   Domains    │  │   Brands     │ │
│  │  Collection  │  │  Collection  │  │  Collection  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└──────────────────────────────────────────────────────────┘
             │
             │ External API Call
             │
┌────────────▼──────────────────────────────────────────┐
│               EXTERNAL SERVICES                        │
│   Nawala Domain Checker API (localhost:5000)          │
└────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend Components
- **Pages**: Home, Domains, Brands, Users, ManualChecker, Login
- **Layout**: Sidebar navigation, main content area
- **Components**: 
  - ProtectedRoute (authentication guard)
  - Modals (delete confirmations)
  - Tables (domain/brand listings)
  - Forms (create/edit interfaces)

#### Backend Components
- **Routes**: Auth, Domain, Brand, Checker
- **Controllers**: Business logic handlers
- **Models**: MongoDB schemas (User, Domain, Brand)
- **Middleware**: Authentication, authorization, validation
- **Services**: Socket.IO event handlers

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **Vite** | 5.0.8 | Build tool & dev server |
| **React Router** | 6.21.0 | Client-side routing |
| **Tailwind CSS** | 3.4.0 | Utility-first CSS framework |
| **Axios** | 1.6.2 | HTTP client |
| **Socket.IO Client** | 4.6.1 | Real-time communication |
| **React Hot Toast** | 2.4.1 | Toast notifications |
| **Lucide React** | 0.303.0 | Icon library |
| **date-fns** | 3.0.6 | Date formatting |
| **Headless UI** | 1.7.17 | Accessible UI components |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 4.18.2 | Web application framework |
| **MongoDB** | 8.0.3 | NoSQL database |
| **Mongoose** | 8.0.3 | MongoDB ODM |
| **Socket.IO** | 4.6.1 | Real-time engine |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 2.4.3 | Password hashing |
| **Express Validator** | 7.0.1 | Input validation |
| **Helmet** | 7.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.0 | HTTP request logger |
| **Express Rate Limit** | 7.1.5 | API rate limiting |
| **dotenv** | 16.3.1 | Environment configuration |

---

## Installation Guide

### Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher
- **MongoDB Atlas Account**: For cloud database
- **Git**: For version control
- **Modern Web Browser**: Chrome, Firefox, Edge, or Safari

### Step-by-Step Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Pawarasasmina/Domain-Checker.git
cd Domain-Checker
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
# Copy the following content and adjust values:
```

**Backend .env Configuration:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

```bash
# Start backend server
npm start

# Or for development with auto-reload:
npm run dev
```

Backend will run on: `http://localhost:5000`

#### 3. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

#### 4. Initial Setup

1. **Access the application**: Open browser to `http://localhost:3000`
2. **Login with admin credentials**:
   - Email: `admin@example.com`
   - Password: `admin123`
3. **Change admin password**: Navigate to profile settings
4. **Create additional users**: Go to Users page (admin only)

---

## Configuration

### Environment Variables

#### Backend Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `your-secret-key` |
| `JWT_EXPIRE` | Token expiration time | `7d`, `24h`, `30m` |
| `CORS_ORIGIN` | Allowed frontend origin | `http://localhost:3000` |
| `ADMIN_EMAIL` | Initial admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Initial admin password | `admin123` |

#### Frontend Configuration

Frontend uses Vite's default configuration. The API base URL is set in `src/config/api.js`:

```javascript
export const API_URL = 'http://localhost:5000';
```

For production, update to your production API URL.

### MongoDB Atlas Setup

1. **Create MongoDB Atlas Account**: Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Create a Cluster**: Choose free tier (M0)
3. **Create Database User**: Set username and password
4. **Whitelist IP Address**: Add `0.0.0.0/0` (all IPs) or specific IPs
5. **Get Connection String**: Copy the connection string
6. **Update .env**: Paste connection string in `MONGODB_URI`

---

## User Roles & Permissions

### Role Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                      ADMIN                          │
│  • Full system access                               │
│  • User management (create, edit, delete)           │
│  • Domain management (all operations)               │
│  • Brand management (all operations)                │
│  • View all statistics                              │
│  • Manual domain checker                            │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                    MANAGER                          │
│  • Domain management (create, edit, delete)         │
│  • Brand management (create, edit, delete)          │
│  • View all statistics                              │
│  • Manual domain checker                            │
│  • ✗ Cannot manage users                            │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│                      USER                           │
│  • View domains (read-only)                         │
│  • View brands (read-only)                          │
│  • View statistics                                  │
│  • Manual domain checker                            │
│  • ✗ Cannot create, edit, or delete                 │
│  • ✗ Cannot manage users                            │
└─────────────────────────────────────────────────────┘
```

### Permission Matrix

| Feature | Admin | Manager | User |
|---------|-------|---------|------|
| **Authentication** |
| Login/Logout | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |
| **Domain Management** |
| View Domains | ✅ | ✅ | ✅ |
| Create Domain | ✅ | ✅ | ❌ |
| Edit Domain | ✅ | ✅ | ❌ |
| Delete Domain | ✅ | ✅ | ❌ |
| CSV Import | ✅ | ✅ | ❌ |
| CSV Export | ✅ | ✅ | ✅ |
| Bulk Delete Blocked | ✅ | ✅ | ❌ |
| **Brand Management** |
| View Brands | ✅ | ✅ | ✅ |
| Create Brand | ✅ | ✅ | ❌ |
| Edit Brand | ✅ | ✅ | ❌ |
| Delete Brand | ✅ | ✅ | ❌ |
| **User Management** |
| View Users | ✅ | ❌ | ❌ |
| Create User | ✅ | ❌ | ❌ |
| Edit User | ✅ | ❌ | ❌ |
| Delete User | ✅ | ❌ | ❌ |
| **Manual Checker** |
| Check Domains | ✅ | ✅ | ✅ |
| **Dashboard** |
| View Statistics | ✅ | ✅ | ✅ |

---

## API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication

All protected endpoints require JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### API Endpoints

#### Authentication Routes

**1. Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}

Response (201):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**2. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

Response (200):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**3. Get Current User**
```http
GET /api/auth/me
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

**4. Get All Users (Admin Only)**
```http
GET /api/auth/users
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "users": [...]
}
```

**5. Update User (Admin Only)**
```http
PUT /api/auth/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com",
  "role": "manager"
}

Response (200):
{
  "success": true,
  "user": {...}
}
```

**6. Delete User (Admin Only)**
```http
DELETE /api/auth/users/:id
Authorization: Bearer <admin_token>

Response (200):
{
  "success": true,
  "message": "User deleted successfully"
}
```

#### Domain Routes

**1. Get All Domains**
```http
GET /api/domains?page=1&limit=50&search=example&brand=brand_id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "count": 150,
  "totalPages": 3,
  "currentPage": 1,
  "domains": [
    {
      "_id": "domain_id",
      "domain": "example.com",
      "brand": {
        "_id": "brand_id",
        "name": "Brand Name"
      },
      "status": "active",
      "uptimeStatus": "active",
      "cloudflareStatus": "active",
      "nawalaStatus": "tidak ada",
      "note": "Important domain",
      "createdAt": "2026-01-15T10:30:00Z",
      "updatedAt": "2026-02-01T14:20:00Z"
    }
  ]
}
```

**2. Get Domain by ID**
```http
GET /api/domains/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "domain": {...}
}
```

**3. Create Domain (Admin/Manager)**
```http
POST /api/domains
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "newdomain.com",
  "brand": "brand_id",
  "status": "active",
  "uptimeStatus": "unknown",
  "cloudflareStatus": "unknown",
  "nawalaStatus": "tidak ada",
  "note": "New domain"
}

Response (201):
{
  "success": true,
  "domain": {...}
}
```

**4. Update Domain (Admin/Manager)**
```http
PUT /api/domains/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "updateddomain.com",
  "status": "blocked"
}

Response (200):
{
  "success": true,
  "domain": {...}
}
```

**5. Delete Domain (Admin/Manager)**
```http
DELETE /api/domains/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Domain deleted successfully"
}
```

**6. Bulk Import (Admin/Manager)**
```http
POST /api/domains/bulk-import
Authorization: Bearer <token>
Content-Type: application/json

{
  "domains": [
    {
      "domain": "domain1.com",
      "brand": "brand_id"
    },
    {
      "domain": "domain2.com/path",
      "brand": "brand_id"
    }
  ]
}

Response (201):
{
  "success": true,
  "message": "Bulk import completed",
  "inserted": 150,
  "failed": 0
}
```

**7. Delete All Blocked (Admin/Manager)**
```http
DELETE /api/domains/bulk-delete-blocked
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Deleted 25 blocked domains"
}
```

#### Brand Routes

**1. Get All Brands**
```http
GET /api/brands
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "brands": [
    {
      "_id": "brand_id",
      "name": "Brand Name",
      "description": "Brand description",
      "domainCount": 45,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

**2. Create Brand (Admin/Manager)**
```http
POST /api/brands
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Brand",
  "description": "Brand description"
}

Response (201):
{
  "success": true,
  "brand": {...}
}
```

**3. Update Brand (Admin/Manager)**
```http
PUT /api/brands/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Brand"
}

Response (200):
{
  "success": true,
  "brand": {...}
}
```

**4. Delete Brand (Admin/Manager)**
```http
DELETE /api/brands/:id
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Brand deleted successfully"
}
```

#### Checker Routes

**1. Bulk Check Domains**
```http
POST /api/bulk-check
Content-Type: application/json

{
  "apiKey": "abcdef123",
  "urls": ["domain1.com", "domain2.com"],
  "mode": "official"
}

Response (200):
{
  "success": true,
  "requestId": "api-1770459968004",
  "timestamp": "2026-02-07T10:26:10.791Z",
  "mode": "official",
  "totalChecked": 2,
  "totalDuration": 2781,
  "results": [
    {
      "domain": "domain1.com",
      "blocked": true,
      "status": "blocked",
      "responseTime": 1832,
      "checkedAt": "2026-02-07T10:26:08.005Z",
      "confidence": "very high",
      "checked": true
    }
  ]
}
```

**2. Get All URLs for Checker**
```http
GET /api/checker/urls
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "urls": ["domain1.com", "domain2.com"]
}
```

**3. Update URL Status**
```http
POST /api/checker/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "domain": "example.com",
  "status": "blocked",
  "nawalaStatus": "ada"
}

Response (200):
{
  "success": true,
  "message": "Domain status updated"
}
```

---

## User Interface Guide

### 1. Login Page

**URL**: `/login`

**Features**:
- Email and password input fields
- Form validation
- Remember me functionality
- Error handling with toast notifications

**Usage**:
1. Enter your email address
2. Enter your password
3. Click "Login" button
4. Upon success, redirected to Home page

### 2. Home Dashboard

**URL**: `/`

**Features**:
- Real-time statistics cards:
  - Total Domains
  - Active Brands
  - Blocked Domains
  - Total Users
- Quick navigation links
- Welcome message with user name

**Access**: All authenticated users

### 3. Money Sites (Domains)

**URL**: `/domains`

**Features**:

#### View Mode (All Users)
- Paginated table (50 domains per page)
- Columns: Domain, Brand, Status, Uptime, Cloudflare, Nawala, Note
- Search functionality
- Brand filter dropdown
- Export to CSV button
- Sticky action buttons (Edit/Delete on right side)

#### Create/Edit Mode (Admin/Manager)
- Add Domain button (top right)
- Modal form with fields:
  - Domain name (required)
  - Brand selection (dropdown)
  - Status buttons (Active/Blocked/Unknown)
  - Uptime status buttons
  - Cloudflare status buttons
  - Nawala status buttons
  - Notes (textarea)
- Save/Cancel buttons

#### Bulk Operations (Admin/Manager)
- **CSV Import**:
  1. Click "Import CSV" button
  2. Upload CSV file with columns: domain, brand
  3. System validates and imports domains
  4. Shows success/failure count

- **CSV Export**:
  1. Click "Export" button
  2. Downloads CSV with all domains (no pagination limit)
  3. Filename: `domains-YYYY-MM-DD.csv`

- **Delete All Blocked**:
  1. Click "Delete All Blocked" button
  2. Modal shows list of all blocked domains
  3. Type "DELETE ALL" to confirm
  4. Click "Delete All" button

#### Delete Single Domain
1. Click trash icon next to domain
2. Modal appears with domain name
3. Type "DELETE" to confirm
4. Click "Delete Domain" button

### 4. Brands

**URL**: `/brands`

**Features**:

#### View Mode (All Users)
- Table showing all brands
- Columns: Name, Description, Domain Count, Created At
- Search functionality

#### Create/Edit Mode (Admin/Manager)
- Add Brand button
- Modal form:
  - Brand name (required)
  - Description (optional)
- Edit button for each brand
- Delete button with confirmation

### 5. Manual Domain Checker

**URL**: `/manual-checker`

**Features**:
- Textarea to enter domains (one per line)
- Maximum 5 domains at once
- "Check Domains" button
- Loading state with spinner
- Results table showing:
  - Domain name
  - Status badge ("Ada" in red or "Tidak Ada" in green)
  - Response time (milliseconds)
  - Confidence level
  - Checked timestamp
- Summary statistics:
  - Total checked
  - Blocked count (red)
  - Accessible count (green)
  - Total duration

**Usage**:
1. Enter up to 5 domains (one per line)
2. Click "Check Domains" button
3. Wait for results (usually 2-5 seconds)
4. View detailed results in table

**Access**: All authenticated users

### 6. Users (Admin Only)

**URL**: `/users`

**Features**:

#### View Mode
- Table showing all users
- Columns: Name, Email, Role, Created At, Actions
- Role badges with colors:
  - Admin: Blue
  - Manager: Yellow
  - User: Gray

#### Create/Edit Mode
- Add User button
- Modal form:
  - Name (required)
  - Email (required, any valid email format)
  - Password (required for new users)
  - Role selection (Admin/Manager/User)
- Edit button for each user
- Delete button with confirmation

**Access**: Admin role only

---

## Database Schema

### User Schema

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt),
  role: String (enum: ['admin', 'manager', 'user'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `email`: Unique index

**Validation**:
- Email format: `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/`
- Password: Minimum 6 characters
- Role: Must be 'admin', 'manager', or 'user'

### Domain Schema

```javascript
{
  _id: ObjectId,
  domain: String (required, unique),
  brand: ObjectId (ref: 'Brand', required),
  status: String (enum: ['active', 'blocked', 'unknown'], default: 'unknown'),
  uptimeStatus: String (enum: ['active', 'inactive', 'unknown'], default: 'unknown'),
  cloudflareStatus: String (enum: ['active', 'inactive', 'unknown'], default: 'unknown'),
  nawalaStatus: String (enum: ['ada', 'tidak ada', 'unknown'], default: 'unknown'),
  note: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `domain`: Unique index
- `brand`: Index for faster lookups
- `status`: Index for filtering
- `nawalaStatus`: Index for blocked domains query

**Validation**:
- Domain format: `/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(\/[a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i`
- Accepts domains with paths (e.g., `example.com/path/to/page`)

### Brand Schema

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**:
- `name`: Unique index

**Virtual Fields**:
- `domainCount`: Count of domains associated with this brand

---

## Security Features

### 1. Authentication & Authorization

- **JWT Tokens**: 
  - Secure token-based authentication
  - 7-day expiration (configurable)
  - Stored in localStorage on client
  - Verified on every protected route

- **Password Security**:
  - Bcrypt hashing with salt rounds (10)
  - Minimum 6 character requirement
  - No plain text storage

- **Role-Based Access Control (RBAC)**:
  - Three-tier permission system
  - Middleware protection on routes
  - Frontend route guards
  - API endpoint protection

### 2. Input Validation

- **Express Validator**:
  - Email format validation
  - Domain format validation
  - Required field checking
  - Type validation
  - Length constraints

- **MongoDB Validation**:
  - Schema-level constraints
  - Enum validation
  - Unique constraints
  - Required fields

### 3. Security Headers (Helmet)

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security
- X-XSS-Protection

### 4. CORS Protection

- Whitelist specific origins
- Credentials support
- Pre-flight request handling
- Configurable via environment variable

### 5. Rate Limiting

- API endpoint rate limiting
- Prevents brute force attacks
- Configurable limits per endpoint
- IP-based tracking

### 6. Error Handling

- Generic error messages to clients
- Detailed error logging on server
- No stack trace exposure in production
- Centralized error handling middleware

### 7. MongoDB Security

- Connection string in environment variables
- No hardcoded credentials
- IP whitelist on MongoDB Atlas
- Database user with minimal permissions

---

## Real-time Features

### Socket.IO Integration

The system uses Socket.IO for real-time bi-directional communication between server and clients.

### Real-time Events

#### Client → Server Events

**1. domain:check**
```javascript
socket.emit('domain:check', { domain: 'example.com' });
```
Triggers manual domain status check.

**2. connection**
```javascript
// Automatic on socket connection
socket.on('connect', () => {
  console.log('Connected to server');
});
```

#### Server → Client Events

**1. domain:status-update**
```javascript
socket.on('domain:status-update', (data) => {
  // Received when any domain status changes
  console.log(`Domain ${data.domain} status: ${data.status}`);
});
```

**2. domain:created**
```javascript
socket.on('domain:created', (domain) => {
  // Received when new domain is created
  console.log('New domain added:', domain);
});
```

**3. domain:updated**
```javascript
socket.on('domain:updated', (domain) => {
  // Received when domain is updated
  console.log('Domain updated:', domain);
});
```

**4. domain:deleted**
```javascript
socket.on('domain:deleted', (domainId) => {
  // Received when domain is deleted
  console.log('Domain deleted:', domainId);
});
```

**5. stats:update**
```javascript
socket.on('stats:update', (stats) => {
  // Received when dashboard statistics change
  console.log('Updated stats:', stats);
});
```

### Implementation Example

**Frontend (React)**:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

useEffect(() => {
  // Listen for domain updates
  socket.on('domain:status-update', (data) => {
    setDomains(prevDomains => 
      prevDomains.map(d => 
        d._id === data.domainId ? { ...d, status: data.status } : d
      )
    );
  });

  return () => socket.disconnect();
}, []);
```

**Backend (Node.js)**:
```javascript
// Emit to all connected clients
io.emit('domain:status-update', {
  domainId: domain._id,
  domain: domain.domain,
  status: 'blocked'
});

// Emit to specific room
io.to('admins').emit('user:created', newUser);
```

---

## Troubleshooting

### Common Issues

#### 1. Cannot Connect to Backend

**Symptoms**:
- "Network Error" in browser console
- Login fails with connection error

**Solutions**:
- Check backend is running: `cd backend && npm start`
- Verify backend URL in frontend config
- Check CORS settings in backend `.env`
- Ensure backend port 5000 is not in use

**Verification**:
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check port usage (Windows)
netstat -ano | findstr :5000
```

#### 2. MongoDB Connection Failed

**Symptoms**:
- "MongoServerError" in backend console
- Cannot start backend server

**Solutions**:
- Verify MongoDB URI in `.env` file
- Check MongoDB Atlas cluster status
- Ensure IP whitelist includes your IP (or use 0.0.0.0/0)
- Verify database user credentials
- Check network connectivity

**Verification**:
```bash
# Test connection
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('Connected')).catch(e => console.log(e));"
```

#### 3. Authentication Token Issues

**Symptoms**:
- Constant logout
- "Token expired" errors
- 401 Unauthorized responses

**Solutions**:
- Clear browser localStorage
- Check JWT_SECRET is set in `.env`
- Verify token expiration time (`JWT_EXPIRE`)
- Ensure system time is correct

**Clear localStorage**:
```javascript
// In browser console
localStorage.clear();
location.reload();
```

#### 4. CSV Import Fails

**Symptoms**:
- "Failed to import domains" error
- Some domains not imported

**Solutions**:
- Check CSV format (domain,brand columns)
- Ensure brand IDs exist in database
- Verify domain format (with paths allowed)
- Check for duplicate domains
- Ensure domains are lowercase

**CSV Format**:
```csv
domain,brand
example.com,brand_id_here
test.com/path,brand_id_here
```

#### 5. Manual Checker Not Working

**Symptoms**:
- "Failed to check domains" error
- No results displayed

**Solutions**:
- Ensure Nawala checker API is running
- Verify API endpoint URL (http://localhost:5000/api/bulk-check)
- Check API key is correct ("abcdef123")
- Ensure domain format is correct
- Check network connectivity

**Test API**:
```powershell
# PowerShell test
$body = @{
    apiKey = "abcdef123"
    urls = @("google.com")
    mode = "official"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/bulk-check" -Method Post -Body $body -ContentType "application/json"
```

#### 6. Manager Role Cannot Login

**Symptoms**:
- "Verification failed" when creating manager
- Manager users show validation error

**Solutions**:
- Restart backend server
- Verify validation middleware includes 'manager' role
- Check User model has 'manager' in role enum
- Clear any cached validation rules

**Verification**:
```bash
# Check validation middleware
grep -n "isIn.*role" backend/middleware/validation.js
# Should show: isIn(['admin', 'manager', 'user'])
```

#### 7. Real-time Updates Not Working

**Symptoms**:
- Domain changes don't reflect immediately
- Other users don't see updates

**Solutions**:
- Check Socket.IO connection in browser console
- Verify Socket.IO server is running
- Check firewall settings
- Ensure CORS allows WebSocket connections

**Verification**:
```javascript
// In browser console
console.log(socket.connected); // Should be true
```

### Error Codes Reference

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check input validation |
| 401 | Unauthorized | Login or refresh token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry (email/domain) |
| 429 | Too Many Requests | Rate limit exceeded, wait |
| 500 | Server Error | Check backend logs |

### Debug Mode

Enable detailed logging:

**Backend**:
```env
# .env
NODE_ENV=development
DEBUG=*
```

**Frontend**:
```javascript
// Add to main.jsx
window.DEBUG = true;
```

---

## Maintenance & Updates

### Regular Maintenance Tasks

#### Daily
- Monitor error logs
- Check server uptime
- Verify database connectivity

#### Weekly
- Review user activity
- Check storage usage (MongoDB Atlas)
- Verify backup status
- Test critical features

#### Monthly
- Update dependencies
- Review security patches
- Database optimization
- Performance analysis

### Backup Procedures

#### MongoDB Backup

**Manual Backup**:
```bash
# Install MongoDB Database Tools
# Download from: https://www.mongodb.com/try/download/database-tools

# Backup specific database
mongodump --uri="YOUR_MONGODB_URI" --out=./backup/$(date +%Y-%m-%d)

# Restore backup
mongorestore --uri="YOUR_MONGODB_URI" ./backup/2026-02-08
```

**Automated Backup** (MongoDB Atlas):
- Enable automated backups in Atlas console
- Configure retention policy
- Test restore procedures quarterly

#### Application Backup

```bash
# Backup entire application
tar -czf domain-dashboard-backup-$(date +%Y-%m-%d).tar.gz \
  --exclude=node_modules \
  --exclude=.git \
  backend/ frontend/

# Restore
tar -xzf domain-dashboard-backup-2026-02-08.tar.gz
```

### Update Procedures

#### Backend Updates

```bash
cd backend

# Check for outdated packages
npm outdated

# Update specific package
npm update express

# Update all packages (caution)
npm update

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Test after updates
npm run dev
```

#### Frontend Updates

```bash
cd frontend

# Check for outdated packages
npm outdated

# Update specific package
npm update react

# Update all packages
npm update

# Rebuild
npm run build
```

### Performance Optimization

#### Database Optimization

```javascript
// Add indexes for frequently queried fields
// Run in MongoDB shell or via script

// Domain indexes
db.domains.createIndex({ domain: 1 });
db.domains.createIndex({ brand: 1 });
db.domains.createIndex({ status: 1 });
db.domains.createIndex({ nawalaStatus: 1 });

// User indexes
db.users.createIndex({ email: 1 }, { unique: true });

// Brand indexes
db.brands.createIndex({ name: 1 }, { unique: true });

// Check index usage
db.domains.aggregate([
  { $indexStats: {} }
]);
```

#### Frontend Optimization

- Enable production build: `npm run build`
- Use code splitting for large components
- Implement lazy loading for routes
- Optimize images and assets
- Enable browser caching

#### Backend Optimization

- Enable compression middleware
- Implement Redis caching for frequent queries
- Use connection pooling for MongoDB
- Optimize API responses (limit fields)
- Implement pagination consistently

### Monitoring

#### Health Check Endpoint

```javascript
// backend/routes/healthRoutes.js
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

**Check health**:
```bash
curl http://localhost:5000/api/health
```

#### Log Monitoring

**Backend logs**:
```bash
# View logs in real-time
tail -f backend/logs/app.log

# Search for errors
grep -i "error" backend/logs/app.log
```

**Frontend logs**:
- Check browser console (F12)
- Review Network tab for failed requests
- Monitor performance tab for slow operations

### Production Deployment

#### Environment Setup

1. **Update environment variables**:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://production_user:password@cluster.mongodb.net/production_db
JWT_SECRET=ultra-secure-production-secret-minimum-32-characters
CORS_ORIGIN=https://yourdomain.com
```

2. **Build frontend**:
```bash
cd frontend
npm run build
```

3. **Serve frontend** (using Express):
```javascript
// backend/server.js
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}
```

4. **Use process manager**:
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start backend/server.js --name domain-dashboard

# Enable auto-restart on system boot
pm2 startup
pm2 save

# Monitor application
pm2 monit

# View logs
pm2 logs domain-dashboard
```

#### Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure CORS origins
- [ ] Enable rate limiting
- [ ] Configure MongoDB IP whitelist
- [ ] Use environment variables for all secrets
- [ ] Enable Helmet security headers
- [ ] Implement API versioning
- [ ] Set up regular backups
- [ ] Monitor error logs
- [ ] Keep dependencies updated

---

## Appendix

### A. Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + K` | Focus search box |
| `Esc` | Close modal |
| `Enter` | Submit form |
| `Ctrl + S` | Save changes |

### B. CSV Import Format

**Required Columns**:
- `domain`: Domain name (e.g., example.com or example.com/path)
- `brand`: Brand ID (must exist in database)

**Optional Columns**:
- `status`: active, blocked, or unknown
- `note`: Additional notes

**Example CSV**:
```csv
domain,brand,status,note
example.com,60abc123def456,active,Main site
test.com/path,60abc123def456,unknown,Test environment
backup.com,60abc789ghi012,active,Backup domain
```

### C. API Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### D. Environment Variable Reference

**Complete .env file template**:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Admin Account
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123

# Optional: Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Optional: Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Optional: Session
SESSION_SECRET=another-secret-key
```

### E. Domain Regex Pattern

**Pattern**: `/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}(\/[a-z0-9\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i`

**Accepts**:
- `example.com`
- `sub.example.com`
- `example.co.uk`
- `example.com/path`
- `example.com/path/to/page`
- `example.com/path?query=value`
- `example.com:8080/path`

**Rejects**:
- `example` (no TLD)
- `.example.com` (leading dot)
- `example..com` (double dot)
- `example .com` (space)

### F. Socket.IO Events Reference

| Event | Direction | Data | Description |
|-------|-----------|------|-------------|
| `connection` | Client → Server | - | Client connected |
| `disconnect` | Client → Server | - | Client disconnected |
| `domain:check` | Client → Server | `{ domain }` | Request domain check |
| `domain:status-update` | Server → Client | `{ domainId, domain, status }` | Domain status changed |
| `domain:created` | Server → Client | `{ domain }` | New domain created |
| `domain:updated` | Server → Client | `{ domain }` | Domain updated |
| `domain:deleted` | Server → Client | `{ domainId }` | Domain deleted |
| `brand:created` | Server → Client | `{ brand }` | New brand created |
| `brand:updated` | Server → Client | `{ brand }` | Brand updated |
| `brand:deleted` | Server → Client | `{ brandId }` | Brand deleted |
| `stats:update` | Server → Client | `{ stats }` | Dashboard stats updated |

### G. Support & Contact

**Repository**: [github.com/Pawarasasmina/Domain-Checker](https://github.com/Pawarasasmina/Domain-Checker)

**Issues**: Submit issues on GitHub repository

**Documentation**: Updated February 8, 2026

---

## Document Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-02-08 | Initial comprehensive documentation |

---

**End of Documentation**

*This document is maintained by Port City Development Team*  
*Last Updated: February 8, 2026*
