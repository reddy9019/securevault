# SecureVault

## Running the Project

Since `docker-compose` might not be available or fully configured on all environments, you can run the services manually.

### Prerequisites
- **.NET 9.0 SDK**
- **Node.js** (LTS version recommended)
- **MySQL**: Ensure a local instance is running.
- **Redis**: (Optional) If required by the backend features.

### 1. Backend (API)
The backend is a .NET Web API. Run it from the solution root:

```bash
dotnet run --project SecureVault.Api
```

**Configuration**: Check `SecureVault.Api/appsettings.json` to ensure the `ConnectionStrings:DefaultConnection` matches your local MySQL credentials (user, password, database name).

### 2. Frontend (React)
The frontend is built with Vite. Open a separate terminal:

```bash
cd frontend
npm install  # (Only needed for the first run or after dependencies change)
npm run dev
```

- Access the Frontend at: `http://localhost:5173`
- The Backend typically runs at: `http://localhost:5000` (or as indicated in logs)
