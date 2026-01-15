# VetSaaS - Veterinary Management System for Large Animals

A complete, production-ready SaaS application for veterinary management of large animals (cattle, horses, goats, pigs, etc.).

## Features

### Core Modules
- **Authentication & Accounts**: Email/password login, JWT authentication, email verification, password reset
- **Dashboard**: Daily appointments, alerts, financial indicators, quick actions
- **Clients/Producers**: Full CRUD, properties management, financial history
- **Animals**: Individual and batch management, species/breeds, genealogy tracking
- **Reproductive Management**: Heat detection, insemination (AI, FTAI), pregnancy diagnosis, birth records
- **Sanitary Management**: Vaccinations, treatments, campaigns, health records
- **Appointments**: Scheduling, services, dynamic forms, reports
- **Financial**: Invoicing, payments, receivables, PDF generation
- **Subscriptions**: Stripe integration, multiple plans, trial support

## Tech Stack

### Backend
- Node.js + Express.js
- MySQL 8+ with Prisma ORM
- JWT Authentication
- Stripe for payments
- PDFKit for report generation

### Frontend
- Expo (React Native)
- Expo Router for navigation
- TanStack React Query
- Zustand for state management
- NativeWind (Tailwind CSS)
- React Hook Form + Yup validation

## Getting Started

### Prerequisites
- Node.js 20+
- MySQL 8+
- Stripe account (for payments)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
DATABASE_URL="mysql://user:password@localhost:3306/vet_saas"
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
STRIPE_SECRET_KEY=sk_test_...
```

5. Run database migrations:
```bash
npm run db:migrate
```

6. Seed initial data:
```bash
npm run db:seed
```

7. Start the server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/v1`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
echo "EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1" > .env
```

4. Start the development server:
```bash
npm start
```

5. Scan the QR code with Expo Go app (iOS/Android) or press `w` for web

## API Documentation

### Authentication
- `POST /api/v1/auth/register` - Register new account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get current user profile

### Clients
- `GET /api/v1/clients` - List all clients
- `POST /api/v1/clients` - Create client
- `GET /api/v1/clients/:id` - Get client details
- `PATCH /api/v1/clients/:id` - Update client
- `DELETE /api/v1/clients/:id` - Delete client

### Animals
- `GET /api/v1/animals` - List all animals
- `POST /api/v1/animals` - Create animal
- `GET /api/v1/animals/:id` - Get animal details
- `PATCH /api/v1/animals/:id` - Update animal
- `DELETE /api/v1/animals/:id` - Delete animal
- `GET /api/v1/animals/:id/genealogy` - Get genealogy tree

### Appointments
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Create appointment
- `GET /api/v1/appointments/today` - Get today's appointments
- `PATCH /api/v1/appointments/:id/status` - Update status

### Financial
- `GET /api/v1/financial/invoices` - List invoices
- `POST /api/v1/financial/invoices` - Create invoice
- `POST /api/v1/financial/invoices/:id/payments` - Record payment
- `GET /api/v1/financial/stats` - Financial statistics

## Project Structure

```
vet-saas/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Seed data
│   ├── src/
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── validators/      # Input validation
│   │   ├── utils/           # Utilities
│   │   └── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── app/                 # Expo Router pages
│   │   ├── auth/            # Auth screens
│   │   ├── (tabs)/          # Main tab screens
│   │   └── _layout.js       # Root layout
│   ├── src/
│   │   ├── api/             # API clients
│   │   ├── components/      # Reusable components
│   │   ├── hooks/           # Custom hooks
│   │   ├── store/           # Zustand stores
│   │   ├── utils/           # Utilities
│   │   └── constants/       # Configuration
│   └── package.json
│
└── README.md
```

## Subscription Plans

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Users | 2 | 5 | 20 |
| Animals | 500 | 2,000 | 10,000 |
| Clients | 100 | 500 | 2,000 |
| Storage | 5 GB | 20 GB | 100 GB |
| Reports | Basic | Advanced | Custom |
| API Access | No | No | Yes |
| Price/month | R$ 99.90 | R$ 199.90 | R$ 499.90 |

## Database Schema

The application uses a comprehensive database schema with the following main entities:
- Accounts & Users (multi-tenant)
- Plans & Subscriptions
- Clients & Properties
- Animals & Batches
- Species & Breeds
- Vaccinations & Health Records
- Reproductive Records & Procedures
- Appointments & Services
- Invoices & Payments
- Notifications & Audit Logs

## Security Features

- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- Input validation
- SQL injection prevention (Prisma)
- XSS protection (Helmet)
- CORS configuration

## License

This project is proprietary software. All rights reserved.

## Support

For support, please contact: support@vetsaas.com
