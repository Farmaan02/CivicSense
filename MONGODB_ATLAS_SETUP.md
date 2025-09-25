# MongoDB Atlas Setup for CivicPulse

This guide explains how to set up MongoDB Atlas for the CivicPulse application.

## Prerequisites

1. A MongoDB Atlas account (free tier available)
2. A MongoDB cluster created in Atlas

## Setting up MongoDB Atlas

### 1. Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account or log in if you already have one

### 2. Create a Cluster

1. Click "Build a Cluster"
2. Select the free tier (M0 Sandbox) if you're just testing
3. Choose a cloud provider and region
4. Click "Create Cluster"

### 3. Configure Database Access

1. In the left sidebar, go to "Database Access" under "Security"
2. Click "Add New Database User"
3. Choose "Password" as the authentication method
4. Enter a username and password (save these for later)
5. For user privileges, select "Atlas Admin"
6. Click "Add User"

### 4. Configure Network Access

1. In the left sidebar, go to "Network Access" under "Security"
2. Click "Add IP Address"
3. For development, you can select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 5. Get Your Connection String

1. Go back to your cluster
2. Click "Connect"
3. Select "Connect your application"
4. Copy the connection string

## Configuring CivicPulse

### Update Environment Variables

In your [.env.local](file:///c:/Users/farma/OneDrive/Desktop/civicSense/.env.local) file, update the [MONGODB_URI](file:///c:/Users/farma/OneDrive/Desktop/civicSense/lib/mongoose.js#L5-L5) with your Atlas connection string:

```env
# Replace the placeholders with your actual credentials
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/civicpulse?retryWrites=true&w=majority
```

Make sure to:
1. Replace `your_username` with your actual MongoDB Atlas username
2. Replace `your_password` with your actual MongoDB Atlas password
3. Replace `your_cluster.mongodb.net` with your actual cluster URL

### Example

If your connection string from Atlas is:
```
mongodb+srv://civicuser:secretpassword@cluster0.abc123.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

Your [.env.local](file:///c:/Users/farma/OneDrive/Desktop/civicSense/.env.local) should contain:
```env
MONGODB_URI=mongodb+srv://civicuser:secretpassword@cluster0.abc123.mongodb.net/civicpulse?retryWrites=true&w=majority
```

## Testing the Connection

Run the health check to verify your MongoDB Atlas connection:

```bash
npm run health
```

If everything is configured correctly, you should see:
```
✅ MongoDB connection successful
✅ MongoDB ping successful
```

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Double-check your username and password
2. **Network Access**: Ensure your IP is whitelisted in Atlas Network Access settings
3. **SSL/TLS Issues**: Make sure you're using Node.js v20.x as required by the project

### Node.js Version

The project requires Node.js v20.x for MongoDB Atlas compatibility. Check your version:
```bash
node --version
```

If you need to switch versions, consider using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager):
```bash
nvm install 20.11.1
nvm use 20.11.1
```

## Running the Application

Once MongoDB Atlas is configured, you can run the application:

```bash
# Install dependencies
npm ci

# Navigate to scripts directory and install backend dependencies
cd scripts
npm ci
cd ..

# Run the application in development mode
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001