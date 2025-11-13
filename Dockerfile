# Stage 1: Build frontend
FROM node:20-alpine AS build
WORKDIR /ifk
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve backend
FROM node:20-alpine
WORKDIR /ifk

# Copy backend dependencies
COPY Server/package*.json ./Server/
RUN cd Server && npm install --production

# Copy backend source
COPY Server ./Server
COPY --from=build /ifk/dist ./Server/public

# Copy frontend build output into the backend's public folder
COPY --from=build /ifk/dist ./Server/public
EXPOSE 5000
CMD ["node", "Server/server.js"]
