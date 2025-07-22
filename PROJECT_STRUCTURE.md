# 📁 Project Structure Guide

## 🏗️ **Current File Structure**

```
cognito/
├── 📁 public/                          # Static assets
│   └── vite.svg
├── 📁 src/                             # Source code
│   ├── 📁 assets/                      # Static assets (images, icons)
│   │   └── react.svg
│   ├── 📁 components/                  # React components
│   │   ├── 📁 auth/                    # Authentication components
│   │   │   └── index.js                # Auth components exports
│   │   ├── 📁 layout/                  # Layout components
│   │   │   └── index.js                # Layout components exports
│   │   ├── 📁 ui/                      # Reusable UI components
│   │   │   └── index.js                # UI components exports
│   │   ├── Dashboard.jsx               # Main dashboard
│   │   ├── ErrorScreen.jsx             # Error display
│   │   ├── Layout.jsx                  # Main layout with sidebar
│   │   ├── LoadingScreen.jsx           # Loading display
│   │   ├── LoginScreen.jsx             # Login interface
│   │   ├── LogoutButtons.jsx           # Logout functionality
│   │   ├── LogoutSuccess.jsx           # Logout success page
│   │   ├── ProtectedRoute.jsx          # Route protection
│   │   ├── Sidebar.jsx                 # Toggleable sidebar
│   │   ├── UserDashboard.jsx           # User-specific dashboard
│   │   ├── UserProfile.jsx             # User profile display
│   │   └── index.js                    # Component exports
│   ├── 📁 constants/                   # Application constants
│   │   └── index.js                    # All constants
│   ├── 📁 context/                     # React contexts
│   │   └── AppContext.jsx              # Global app state
│   ├── 📁 hooks/                       # Custom React hooks
│   │   ├── useApi.js                   # API interaction hooks
│   │   └── useSecureAuth.js            # Enhanced auth hook
│   ├── 📁 services/                    # External services
│   │   └── apiService.js               # API service layer
│   ├── 📁 types/                       # Type definitions
│   │   └── index.js                    # JSDoc type definitions
│   ├── 📁 utils/                       # Utility functions
│   │   ├── security.js                 # Security utilities
│   │   └── index.js                    # General utilities
│   ├── App.jsx                         # Main app component
│   ├── App.css                         # App-specific styles
│   ├── index.css                       # Global styles
│   └── main.jsx                        # App entry point
├── 📄 .env                             # Environment variables
├── 📄 .env.example                     # Environment template
├── 📄 package.json                     # Dependencies
├── 📄 vite.config.js                   # Vite configuration
├── 📄 tailwind.config.js               # Tailwind configuration
├── 📄 eslint.config.js                 # ESLint configuration
└── 📄 README.md                        # Project documentation
```

---

## 📋 **Component Organization**

### **🔐 Authentication Components** (`src/components/auth/`)
- `LoginScreen.jsx` - User login interface
- `LogoutButtons.jsx` - Logout functionality
- `LogoutSuccess.jsx` - Post-logout page
- `ProtectedRoute.jsx` - Route access control
- `UserProfile.jsx` - User information display

### **🎨 UI Components** (`src/components/ui/`)
- `LoadingScreen.jsx` - Loading states
- `ErrorScreen.jsx` - Error displays
- *Future: Button, Input, Modal, Toast, etc.*

### **📐 Layout Components** (`src/components/layout/`)
- `Dashboard.jsx` - Main dashboard layout
- `UserDashboard.jsx` - User-specific layout
- `Layout.jsx` - Main layout wrapper with header and sidebar
- `Sidebar.jsx` - Toggleable navigation sidebar
- *Future: Header, Footer, Navigation, etc.*

---

## 🔧 **Core Architecture**

### **🎣 Custom Hooks** (`src/hooks/`)
- `useApi.js` - API interaction and data fetching
- `useSecureAuth.js` - Enhanced authentication with security

### **🌐 Services** (`src/services/`)
- `apiService.js` - HTTP client with authentication

### **🛠️ Utilities** (`src/utils/`)
- `security.js` - Security validation and logging
- `index.js` - General utility functions

### **📊 Context** (`src/context/`)
- `AppContext.jsx` - Global application state management

### **📝 Constants** (`src/constants/`)
- Application-wide constants and configuration

### **🏷️ Types** (`src/types/`)
- JSDoc type definitions for better development

---

## 🚀 **Adding New Components**

### **1. UI Components**
```javascript
// src/components/ui/Button.jsx
import React from 'react';

const Button = ({ children, variant = 'primary', ...props }) => {
  return (
    <button 
      className={`btn btn-${variant}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
```

### **2. Feature Components**
```javascript
// src/components/features/UserSettings.jsx
import React from 'react';
import { useApp } from '../../context/AppContext';

const UserSettings = () => {
  const { theme, setTheme } = useApp();
  
  return (
    <div className="user-settings">
      {/* Settings UI */}
    </div>
  );
};

export default UserSettings;
```

### **3. Page Components**
```javascript
// src/components/pages/SettingsPage.jsx
import React from 'react';
import { ProtectedRoute } from '../auth';
import { UserSettings } from '../features';

const SettingsPage = () => {
  return (
    <ProtectedRoute requiredScopes={['profile']}>
      <div className="settings-page">
        <UserSettings />
      </div>
    </ProtectedRoute>
  );
};

export default SettingsPage;
```

---

## 📦 **Recommended Folder Structure for Growth**

```
src/components/
├── auth/           # Authentication related
├── ui/             # Reusable UI elements
├── layout/         # Layout and structure
├── features/       # Feature-specific components
├── pages/          # Full page components
└── forms/          # Form components
```

---

## 🎯 **Best Practices**

### **1. Component Naming**
- Use PascalCase for component files
- Use descriptive names: `UserProfileCard.jsx` not `Card.jsx`
- Group related components in folders

### **2. Import Organization**
```javascript
// External imports first
import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

// Internal imports second
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui';
import { formatDate } from '../utils';
```

### **3. Export Patterns**
```javascript
// Named exports for utilities
export { formatDate, debounce };

// Default export for components
export default UserProfile;

// Re-exports for organization
export { default as Button } from './Button';
```

### **4. File Organization**
- Keep components under 300 lines
- Split large components into smaller ones
- Use custom hooks for complex logic
- Keep styles close to components

---

## 🔄 **Future Enhancements**

### **Ready to Add:**
- 🎨 More UI components (Button, Input, Modal)
- 📱 Responsive layout components
- 🔔 Notification system
- 🌙 Theme switching
- 🌍 Internationalization
- 📊 Data visualization components
- 🔍 Search functionality
- 📋 Form validation
- 🎭 Animation components
- 📱 Mobile-specific components

Your project structure is now **scalable** and **organized** for future growth! 🚀
