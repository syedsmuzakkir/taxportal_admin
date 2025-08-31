# TaxPortal-Demo

A comprehensive role-based tax portal demo with centralized authentication, two-factor authentication, and permission management.

## Features

- **Role-Based Authentication**: Admin, User, Client, and Reviewer roles with different access levels
- **Two-Factor Authentication**: Secure 2FA flow with simulated code generation
- **Centralized Permissions**: Single source of truth for all route and component permissions
- **Complete UI**: Professional business application with responsive design
- **Dummy Data**: Fully functional with realistic dummy data and localStorage persistence
- **Real-time Notifications**: Activity tracking and notification center
- **Document Management**: Secure document previewer with download restrictions
- **Invoice Management**: Full invoice creation and management system
- **Payment Tracking**: Payment history and refund capabilities

## Demo Accounts

Use these credentials to test different roles:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Admin | admin@demo.test | Password123 | Full system access |
| User | user@demo.test | Password123 | Customer and invoice management |
| Client | client@demo.test | Password123 | Own data only |
| Reviewer | reviewer@demo.test | Password123 | Review and status updates |

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to the local server URL

4. **Login** with any of the demo accounts above

5. **Enter 2FA code** - The code will be displayed in the browser console for demo purposes

## Usage Guide

### Authentication Flow
1. Enter email and password on the login page
2. Check browser console for the 2FA code
3. Enter the 6-digit code on the 2FA page
4. Get redirected to the role-appropriate dashboard

### Testing Permissions
- Login as **Admin** to see all features and edit user permissions
- Use **Users & Roles Management** page to modify permissions in real-time
- Test different roles to see permission-based UI changes

### Key Features to Test
- **Create Invoice**: Use the Invoices page to create full invoices with line items
- **Update Return Status**: Change tax return statuses (admin/reviewer only)
- **Document Viewer**: View documents with download restrictions based on role
- **Permission Editing**: Admin can modify permissions with immediate effect
- **Notifications**: All major actions generate notifications
- **Responsive Design**: Test on different screen sizes

## Architecture

### Permission System
All permissions are managed through `src/utils/permissionsManager.js` with the following structure:

```javascript
{
  "permissions": {
    "page:overview": ["admin", "user", "client", "reviewer"],
    "page:customers": ["admin", "user"],
    "page:users_management": ["admin"],
    "action:document.download": ["admin"],
    // ... more permissions
  },
  "roleOverrides": {
    "client": {
      "page:customers": ["own"] // Can only view own data
    }
  }
}
```

### Data Persistence
- All data is stored in localStorage
- Changes persist across page refreshes
- Use Settings page to reset demo data

### File Structure
```
src/
├── api/              # Simulated API layer
├── components/       # Reusable UI components
├── contexts/         # React contexts for state management
├── pages/           # Application pages
├── utils/           # Utility functions
└── seedData.js      # Initial demo data
```

## Development Notes

- Built with React 18, Vite, and Tailwind CSS
- No TypeScript - pure JavaScript/JSX
- All icons from Lucide React
- Responsive design with mobile-first approach
- Accessibility features included
- Professional business application aesthetics

## Testing Scenarios

1. **Login Flow**: Test 2FA with different accounts
2. **Permission Changes**: Admin modifies user permissions → immediate UI updates
3. **Invoice Creation**: Create invoice → notification generated → appears in table
4. **Status Updates**: Change return status → notification sent to reviewers
5. **Document Security**: Try to download without permission (blocked)
6. **Data Persistence**: Make changes → refresh page → changes remain
7. **Role Switching**: Login as different roles → different available features
8. **Responsive Design**: Test on mobile/tablet/desktop

The application demonstrates enterprise-level features while running entirely on dummy data for safe testing and demonstration.