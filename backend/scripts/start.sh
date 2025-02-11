#!/bin/sh

echo "Running TypeORM migrations..."
npm run migration:run

echo "Starting the application..."
npm run start:prod 