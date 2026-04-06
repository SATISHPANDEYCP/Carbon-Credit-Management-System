# Carbon Credit Management System

A full-stack web application for tracking and managing carbon credits. Users can measure their carbon footprint, log eco-friendly actions, purchase carbon offsets, and share credits with others.

## What Does It Do?

This system helps individuals and organizations manage their carbon footprint:

- **Measure** - Track carbon emissions from transport, electricity, waste, and manufacturing
- **Reduce** - Log reduction activities like tree planting, solar installation, or recycling and earn credits
- **Offset** - Purchase carbon credits from verified green projects
- **Share** - Transfer credits to other users
- **Dashboard** - View your carbon balance, statistics, and transaction history
- **Blockchain Simulation** - All transactions are logged in an immutable ledger (using MongoDB)

## Tech Stack

**Frontend**
- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Pure CSS styling

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password security

**DevOps**
- Docker + Docker Compose
- Jenkins CI/CD pipeline
- Nginx reverse proxy

## Prerequisites

Before you start, make sure you have:

- Node.js (v18 or higher)
- MongoDB (Atlas account or local installation)
- Git
- Docker (optional, but recommended)

## Quick Start

### Option 1: Using Docker (Easiest)

1. Clone the repository:
```bash
git clone <your-repo-url>
cd carbon-credit-management-system
```

2. Start all services:
```bash
docker-compose up --build
```

That's it! The app will be running at `http://localhost:5173`

### Option 2: Manual Setup

**Step 1: Setup Backend**

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
PORT=5000
MONGO_URI=mongodb+srv://your-username:password@cluster.mongodb.net/carbon-credit-db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

Seed the database with sample offset projects:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`

**Step 2: Setup Frontend**

Open a new terminal:
```bash
cd frontend
npm install
```

Create a `.env` file in the frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

## How to Use

1. Open `http://localhost:5173` in your browser
2. Register a new account
3. Login with your credentials
4. Start measuring your carbon footprint or logging reduction activities
5. Check your dashboard to see your carbon balance
6. Purchase offsets or share credits with others

## API Endpoints

All endpoints are prefixed with `/api`

**Authentication (Public)**
- `POST /auth/register` - Create a new account
- `POST /auth/login` - Login and get JWT token

**Carbon Operations (Requires Login)**
- `POST /carbon/measure` - Record a carbon emission activity
- `GET /carbon/measure` - Get your emission history
- `POST /carbon/reduce` - Log a reduction activity and earn credits
- `POST /carbon/offset` - Purchase carbon credits from a project
- `GET /carbon/offset/projects` - View available offset projects
- `POST /carbon/share` - Transfer credits to another user

**Dashboard (Requires Login)**
- `GET /dashboard/summary` - Get your stats and balance
- `GET /dashboard/transactions` - View transaction history

## Database Schema

The system uses MongoDB with these collections:

**users** - User accounts with carbon balance  
**carbon_activities** - Logged emissions (measure)  
**carbon_reductions** - Logged reduction actions (reduce)  
**offset_projects** - Available projects for purchasing credits  
**carbon_offsets** - Records of credit purchases  
**transactions** - Complete ledger of all credit movements (blockchain simulation)  
**audit_logs** - Security and compliance tracking  

## How Carbon Calculations Work

### Measuring Emissions

When you log an activity, the system calculates CO₂ based on these rates:

- **Car**: 0.23 kg CO₂ per km
- **Bus**: 0.10 kg CO₂ per km
- **Train**: 0.04 kg CO₂ per km
- **Flight**: 0.25 kg CO₂ per km
- **Electricity**: 0.5 kg CO₂ per kWh
- **Waste**: 0.3 kg CO₂ per kg
- **Manufacturing**: 1.5 kg CO₂ per unit

Your carbon balance decreases based on the calculated emissions.

### Earning Credits (Reduce)

When you log eco-friendly actions, you earn credits:
- **1 kg of CO₂ reduced = 0.1 carbon credit**

Examples: planting trees, installing solar panels, recycling, or improving energy efficiency.

### Blockchain Simulation

Instead of real blockchain, we use a `transactions` collection that acts as an immutable ledger:
- Every action (measure, reduce, offset, share) creates a permanent transaction record
- Each transaction has a unique ID and timestamp
- Transactions link to users and show credit movements
- This provides transparency and audit capability similar to blockchain

## Testing the System

Try this flow to see everything in action:

1. Register a new user account
2. Login and note your starting balance (0 credits)
3. Measure an emission (e.g., "I drove 100 km by car")
4. Check dashboard - your balance should be negative
5. Log a reduction (e.g., "Planted 5 trees that absorb 50 kg CO₂")
6. Check dashboard - you earned credits
7. Browse offset projects and purchase credits
8. Create another user and share credits between them
9. View transaction history - see the blockchain-like ledger

## Deployment

### Using Docker

```bash
docker-compose up --build
```

### CI/CD with Jenkins

The `Jenkinsfile` in this repo sets up automated deployment:
1. Pulls code from GitHub when you push changes
2. Runs tests to verify everything works
3. Builds Docker images
4. Deploys to your server

### Manual Deployment on AWS EC2

1. Launch an EC2 instance and SSH into it
2. Install Node.js, MongoDB, and Nginx
3. Clone this repository
4. Set up environment variables
5. Build the frontend: `cd frontend && npm run build`
6. Use PM2 to run the backend: `pm2 start backend/server.js`
7. Configure Nginx to serve the frontend and proxy API requests

## Git Commit Guidelines

Follow these formats for clear commit history:

```bash
feat: add carbon offset purchase feature
fix: correct credit calculation for electricity
docs: update API documentation
chore: update dependencies
```

Example workflow:
```bash
git checkout -b feat/share-credits
git add .
git commit -m "feat: implement credit sharing between users"
git push origin feat/share-credits
```

Then create a Pull Request and merge to main.

## Environment Variables

**Backend (.env in backend/ folder)**
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/carbon-credit-db
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

**Frontend (.env in frontend/ folder)**
```
VITE_API_URL=http://localhost:5000/api
```

## Security Features

- Passwords are hashed using bcryptjs before storing
- JWT tokens for secure authentication
- Protected routes on both frontend and backend
- Input validation on all API endpoints
- Audit logging tracks all sensitive operations
- CORS configured to allow only trusted origins

## Project Structure

```
carbon-credit-management-system/
├── backend/                    # Node.js backend
│   ├── src/
│   │   ├── config/            # Database connection
│   │   ├── models/            # MongoDB schemas
│   │   ├── controllers/       # Business logic
│   │   ├── routes/            # API endpoints
│   │   ├── middlewares/       # Auth & error handling
│   │   ├── services/          # Carbon calculator & transactions
│   │   ├── utils/             # Validators
│   │   └── seed/              # Sample data
│   └── server.js              # Entry point
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/             # All page components
│   │   ├── components/        # Reusable UI components
│   │   ├── api/               # API call functions
│   │   ├── context/           # Auth state management
│   │   ├── styles/            # CSS files
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   └── index.html
├── docker-compose.yml          # Docker orchestration
├── Jenkinsfile                 # CI/CD pipeline
├── nginx.conf                  # Web server config
└── README.md                   # You are here
```

## What's Next?

Ideas for future enhancements:
- Integrate real blockchain (Ethereum or Hyperledger)
- Add payment gateway for buying credits
- Build a mobile app
- Add social features like leaderboards
- Send email notifications
- Multi-language support
- Advanced analytics and insights

## License

MIT License - feel free to use this project for learning or production.
