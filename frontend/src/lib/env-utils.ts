import { EnvironmentVariable } from '@/types/environment';
import { generateUUID } from './utils';

const isSecretKey = (key: string): boolean => {
  const secretPatterns = [
    /secret/i,
    /password/i,
    /key/i,
    /token/i,
    /auth/i,
    /cert/i,
    /private/i,
    /credential/i
  ];
  return secretPatterns.some(pattern => pattern.test(key));
};

export const parseEnvFile = (content: string): EnvironmentVariable[] => {
  const variables: EnvironmentVariable[] = [];
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) return;
    
    const [key, ...valueParts] = line.split('=');
    if (!key || !valueParts.length) return;
    
    const value = valueParts.join('=');
    const now = new Date().toISOString();
    variables.push({
      id: generateUUID(),
      key: key.trim(),
      value: value.trim(),
      isSecret: isSecretKey(key.trim()),
      created_at: now,
      updated_at: now
    });
  });
  
  return variables;
}; 