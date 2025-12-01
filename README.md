# 1. Change directory to the micro service
```
cd ./auth-service
```

# 2. Install dependecies
```
npm install
```

# 3. Set up environment variables  
Copy .env.example to .env and update the values:

# 4. Run PostgreSQL on Docker
Docker-compose already on the project
```
docker-compose up
```

# 5. Generate Prisma client
```
npx prisma generate
```

# 6. Apply database migrations
```
npx prisma migrate dev
```

# 7. Run the development server
```
npm run dev
```
