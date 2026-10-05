# Krishna Travels CRM Backend

Backend system for Krishna Travels CRM. Built with Node.js, Express, PostgreSQL, and Prisma.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Testing:** Jest

## Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## PostgreSQL Installation and Setup

### Local Installation
1. Download and install PostgreSQL from the [official website](https://www.postgresql.org/download/).
2. During installation, set a password for the default `postgres` user.
3. Open pgAdmin or `psql` and connect to the local server.

### Database Creation
Run the following SQL to create the database:
```sql
CREATE DATABASE krishna_travels;
```

## Environment Variables
Create a `.env` file in the root directory based on `.env.example`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/krishna_travels"
ALLOWED_IP_1=127.0.0.1
ALLOWED_IP_2=192.168.1.100
CORS_ORIGIN=http://localhost:5173
```

## Prisma Setup and Migration Commands
Once the `.env` file is ready with the valid `DATABASE_URL`:

1. **Format Schema:**
   ```bash
   npx prisma format
   ```
2. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```
3. **Run Migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```
4. **Open Prisma Studio (Database GUI):**
   ```bash
   npx prisma studio
   ```

## Development Commands
Start the server in development mode with hot-reloading:
```bash
npm run dev
```

Run tests:
```bash
npm run test
```

## Production Commands
Start the server in production mode:
```bash
npm start
```
*Note: In production, it's recommended to use a process manager like PM2.*

## API Endpoints

### Customer Routes
- `POST /api/customers/register` - Register a new customer
- `GET /api/customers/search?identifier=...&value=...` - Search a customer
- `GET /api/customers/history?identifier=...&value=...` - Get customer sale history

### Sale Routes
- `POST /api/sales/new` - Create a new sale
- `GET /api/sales/:saleId` - Get sale details

## Example API Requests and Responses

### Register Customer
**Request:** `POST /api/customers/register`
```json
{
  "fullName": "Rahul Kumar",
  "mobile": "9876543210",
  "whatsapp": "9876543210",
  "customerSource": "Walk-in"
}
```
**Response (Success):**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "customerId": "KT-A1B2C3"
  }
}
```

### Create Sale
**Request:** `POST /api/sales/new`
```json
{
  "customerSearchType": "customerId",
  "customerSearchValue": "KT-A1B2C3",
  "invoiceId": "INV-1001",
  "bookingDate": "2023-10-25T00:00:00.000Z",
  "bookingSource": "Walk-in",
  "customerType": "Retail",
  "serviceType": "Flight",
  "totalSaleAmount": 5000,
  "totalPaid": 2000,
  "paymentStatus": "Partial",
  "bookingStatus": "Confirmed",
  "serviceDetails": {
    "airline": "IndiGo",
    "pnr": "XY12Z3"
  }
}
```
**Response (Success):**
```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "id": 1,
    "invoiceId": "INV-1001",
    "totalOutstanding": "3000.00",
    ...
  }
}
```

## VPS Deployment Instructions
1. Install Node.js, Nginx, and PostgreSQL on your VPS.
2. Clone the repository and `cd` into the backend directory.
3. Run `npm install` to install dependencies.
4. Set up `.env` with production variables and proper `DATABASE_URL`.
5. Run `npx prisma generate` and `npx prisma migrate deploy`.
6. Start the app using PM2: `pm2 start src/server.js --name krishna-crm`.

### Nginx Reverse Proxy Configuration
Configure Nginx to forward requests to the Node.js server. **Important:** ensure that `X-Forwarded-For` is passed correctly so the IP allowlist middleware works:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## IP Allowlist Configuration
The CRM is designed to be highly restricted. Access is controlled via environment variables:
- `ALLOWED_IP_1`
- `ALLOWED_IP_2`

Set these in the `.env` file to the static IP addresses of the two approved office networks. All other requests will be rejected with HTTP 403.

## PostgreSQL Security Instructions
1. **Never Expose PostgreSQL:** Ensure `listen_addresses` in `postgresql.conf` is set to `localhost` (`127.0.0.1`) so it only accepts connections from the local VPS environment.
2. **UFW / Firewall:** Block port `5432` from public access using your VPS firewall (e.g., `ufw deny 5432`).
3. **Strong Passwords:** Always use a secure, randomly generated password for the PostgreSQL database user.
