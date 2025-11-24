# MetalReact Admin Panel V2

Modern admin panel for monitoring and managing MetalReact services.

## Features

- **Dashboard**: Real-time system stats and service health monitoring
- **Users Management**: Grant/revoke premium, ban/unban users, search and filter
- **Pins Moderation**: Edit, delete, block/unblock pins, extend expiration
- **Cards Management**: View and moderate user cards
- **Logs Viewer**: Separate logs for user actions and parser activity
- **Service Control**: Restart individual or critical services

## Tech Stack

- **Frontend**: Vite + React + TypeScript + Material UI
- **Backend**: FastAPI + PostgreSQL
- **Charts**: Recharts
- **Data Tables**: MUI X DataGrid

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Development:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Deploy:
```bash
scp -r dist/* root@server:/var/www/monitor-v2/
```

## API Endpoints

All endpoints require `X-Admin-Password` header for authentication.

### Users
- `GET /monitor/users` - List users with filters
- `GET /monitor/users/{id}` - User details
- `POST /monitor/users/{id}/premium` - Grant premium
- `DELETE /monitor/users/{id}/premium` - Revoke premium
- `POST /monitor/users/{id}/ban` - Ban user
- `DELETE /monitor/users/{id}/ban` - Unban user

### Pins
- `GET /monitor/pins` - List pins with filters
- `GET /monitor/pins/{id}` - Pin details
- `PUT /monitor/pins/{id}` - Edit pin
- `DELETE /monitor/pins/{id}` - Delete pin
- `POST /monitor/pins/{id}/extend` - Extend expiration
- `POST /monitor/pins/{id}/block` - Block pin
- `DELETE /monitor/pins/{id}/block` - Unblock pin

### Analytics
- `GET /monitor/analytics/dashboard` - Dashboard stats
- `GET /monitor/analytics/users-growth` - User growth chart
- `GET /monitor/analytics/top-users` - Top active users

### Services
- `GET /monitor/services` - All services status
- `POST /monitor/services/{name}/restart` - Restart service
- `POST /monitor/services/restart-critical` - Restart critical services

### Logs
- `GET /monitor/logs/user-actions` - User action logs
- `GET /monitor/logs/parser-activity` - Parser activity logs

## Security

- One-time access tokens (already implemented in backend)
- Admin password required for all operations
- Automatic logout on 403 errors
- CORS configured for admin domain only

## Mobile Support

Responsive design works on tablets and phones. All tables and modals adapt to small screens.
