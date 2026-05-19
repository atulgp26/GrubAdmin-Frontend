# API Setup Documentation

## Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api

```

## API Structure

The API is organized in the following structure:

```
src/api/
├── config.js              # API configuration and endpoints
├── httpClient.js          # Centralized HTTP client
└── services/
    ├── index.js           # Main export file
    ├── authService.js     # Authentication services
    ├── employeeService.js # Employee management services
    ├── clientService.js   # Client management services
    ├── supportService.js  # Support ticket services
    ├── notificationService.js # Notification services
    └── dashboardService.js # Dashboard services
```

## Usage Examples

### Basic Usage
```javascript
import { authService, employeeService } from '@/api/services';

// Login
const loginData = await authService.login({ email, password });

// Get employees
const employees = await employeeService.getEmployees({ page: 1, limit: 10 });

// Create employee
const newEmployee = await employeeService.createEmployee(employeeData);
```

### Custom HTTP Requests
```javascript
import { httpClient } from '@/api/services';

// Custom GET request
const data = await httpClient.get('/custom-endpoint', { param: 'value' });

// Custom POST request
const result = await httpClient.post('/custom-endpoint', { data: 'value' });
```

## Features

- ✅ Centralized HTTP client with retry mechanism
- ✅ Automatic authentication token handling
- ✅ Request timeout and error handling
- ✅ TypeScript-ready structure
- ✅ Modular service organization
- ✅ Environment-based configuration
- ✅ File upload support
- ✅ Request/response interceptors ready
