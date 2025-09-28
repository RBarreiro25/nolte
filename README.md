# Nolte Event Service

## How to Run both FrontEnd and BackEnd Locally

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation & Setup

1. **Clone and install**
```bash
git clone <https://github.com/RBarreiro25/nolte.git>
cd nolte-challenge
npm install
```

2. **Environment Configuration**
```bash
# Copy environment template and customize if needed
cp .env.example .env
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Access the Application**
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

### Testing
```bash
npm test                 # Run integration tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

## API Endpoints

### Authentication
All admin endpoints require: `Authorization: Bearer admin-token-123`

#### **POST /api/events** (Admin)
Create a new event
```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer admin-token-123" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2024",
    "startAt": "2024-12-01T10:00:00Z",
    "endAt": "2024-12-01T18:00:00Z",
    "location": "San Francisco",
    "status": "DRAFT",
    "internalNotes": "VIP speakers confirmed"
  }'
```

#### **PATCH /api/events/:id** (Admin)
Update event status or notes
```bash
curl -X PATCH http://localhost:3000/api/events/{id} \
  -H "Authorization: Bearer admin-token-123" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PUBLISHED",
    "internalNotes": "Updated speaker lineup"
  }'
```

#### **GET /api/events** (Admin)
Get events with filters and pagination
```bash
curl "http://localhost:3000/api/events?page=1&limit=20&status=PUBLISHED&locations=San Francisco&dateFrom=2024-01-01&dateTo=2024-12-31" \
  -H "Authorization: Bearer admin-token-123"
```

#### **GET /api/public/events** (Public)
Get published/cancelled events (no auth required)
```bash
curl "http://localhost:3000/api/public/events?page=1&limit=10&locations=San Francisco&dateFrom=2024-01-01&dateTo=2024-12-31"
```

#### **GET /api/public/events/:id/summary** (Public)
Stream AI-generated event summary
```bash
curl "http://localhost:3000/api/public/events/{id}/summary" \
  -H "Accept: text/event-stream"
```

## Architecture

### Clean Architecture Layers
```
src/app/api/
├── domain/          # Business logic & entities
├── data/            # Use cases implementation  
├── infra/           # External adapters (DB, cache, etc.)
├── presentation/    # Controllers & HTTP layer
└── main/            # DI & route configuration
```

### Project Structure
```
├── src/app/
│   ├── api/                 # Backend API
│   ├── frontend/            # React components
│   └── page.tsx             # Main page
├── jest.config.js           # Test configuration
└── package.json
```

## Frontend Usage

1. **Admin Mode**: Login with `admin-token-123` to manage events
2. **Public Mode**: View published events and AI summaries  
3. **Event Creation**: Fill form with future dates, status defaults to DRAFT
4. **Status Updates**: Use dropdown to transition between states
5. **AI Summaries**: Click "Show AI Summary" on published events

### Status Transition Rules
- **DRAFT** → PUBLISHED ✅
- **DRAFT** → CANCELLED ✅  
- **PUBLISHED** → CANCELLED ✅
- **PUBLISHED/CANCELLED** → DRAFT ❌
