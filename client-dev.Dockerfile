# syntax=docker.io/docker/dockerfile:1.7-labs
FROM node:20-alpine

RUN corepack enable

RUN addgroup app && adduser -S -G app app

# Use root for installations to avoid permission issues
USER root

WORKDIR /app

# Copy all necessary files and install dependencies
COPY --exclude=./server . .

# Install dependencies first to generate pnpm-lock.yaml
RUN pnpm install  # This will create pnpm-lock.yaml

WORKDIR /app/client

# Copy only the package.json files for the client
COPY client/package*.json ./

# Install client dependencies
RUN pnpm install

# Copy the rest of the client files
COPY client/ ./

# Change ownership to the app user
RUN chown -R app:app /app

# Switch back to the app user
USER app

EXPOSE 5173

CMD ["npm", "run", "dev"]
