/**
 * Project Types
 * 
 * Common types and enums for projects
 */

export enum ResourceType {
  DATABASE = 'database',
  SERVICE = 'service',
  WEBSITE = 'website'
}

export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  NONE = 'none'
}

export enum ServiceType {
  NODEJS = 'nodejs',
  PYTHON = 'python',
  PHP = 'php',
  CUSTOM_DOCKER = 'custom_docker',
  SUPABASE = 'supabase',
  POCKETBASE = 'pocketbase',
  APPWRITE = 'appwrite'
} 