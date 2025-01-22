import { Injectable } from '@nestjs/common';
import { ProjectType } from '../types/project.types';
import { EnvTemplateResponseDto } from '../dto/env-template.dto';

@Injectable()
export class EnvTemplateService {
  private readonly templates: Record<ProjectType, EnvTemplateResponseDto> = {
    [ProjectType.NODEJS]: {
      variables: [
        {
          key: 'NODE_ENV',
          value: 'development',
          isSecret: false,
          description: 'Node.js environment (development/production)'
        },
        {
          key: 'PORT',
          value: '3000',
          isSecret: false,
          description: 'Port number for the application'
        },
        {
          key: 'DATABASE_URL',
          value: '',
          isSecret: true,
          description: 'Database connection string'
        },
        {
          key: 'JWT_SECRET',
          value: '',
          isSecret: true,
          description: 'Secret key for JWT authentication'
        }
      ]
    },
    [ProjectType.PYTHON]: {
      variables: [
        {
          key: 'FLASK_ENV',
          value: 'development',
          isSecret: false,
          description: 'Flask environment (development/production)'
        },
        {
          key: 'FLASK_APP',
          value: 'app.py',
          isSecret: false,
          description: 'Flask application entry point'
        },
        {
          key: 'DATABASE_URL',
          value: '',
          isSecret: true,
          description: 'Database connection string'
        },
        {
          key: 'SECRET_KEY',
          value: '',
          isSecret: true,
          description: 'Secret key for session management'
        }
      ]
    },
    [ProjectType.PHP]: {
      variables: [
        {
          key: 'APP_ENV',
          value: 'local',
          isSecret: false,
          description: 'Application environment (local/production)'
        },
        {
          key: 'APP_DEBUG',
          value: 'true',
          isSecret: false,
          description: 'Enable debug mode'
        },
        {
          key: 'DB_CONNECTION',
          value: 'mysql',
          isSecret: false,
          description: 'Database connection type'
        },
        {
          key: 'DB_HOST',
          value: 'localhost',
          isSecret: false,
          description: 'Database host'
        },
        {
          key: 'DB_USERNAME',
          value: '',
          isSecret: true,
          description: 'Database username'
        },
        {
          key: 'DB_PASSWORD',
          value: '',
          isSecret: true,
          description: 'Database password'
        }
      ]
    },
    [ProjectType.DOCKER]: {
      variables: [
        {
          key: 'COMPOSE_PROJECT_NAME',
          value: '',
          isSecret: false,
          description: 'Docker Compose project name'
        },
        {
          key: 'DOCKER_HOST',
          value: '',
          isSecret: false,
          description: 'Docker host URL'
        }
      ]
    },
    [ProjectType.DATABASE]: {
      variables: [
        {
          key: 'DB_HOST',
          value: 'localhost',
          isSecret: false,
          description: 'Database host'
        },
        {
          key: 'DB_PORT',
          value: '5432',
          isSecret: false,
          description: 'Database port'
        },
        {
          key: 'DB_NAME',
          value: '',
          isSecret: false,
          description: 'Database name'
        },
        {
          key: 'DB_USER',
          value: '',
          isSecret: true,
          description: 'Database username'
        },
        {
          key: 'DB_PASSWORD',
          value: '',
          isSecret: true,
          description: 'Database password'
        }
      ]
    },
    [ProjectType.WEBSITE]: {
      variables: [
        {
          key: 'SITE_URL',
          value: '',
          isSecret: false,
          description: 'Website URL'
        },
        {
          key: 'API_URL',
          value: '',
          isSecret: false,
          description: 'API endpoint URL'
        },
        {
          key: 'GA_TRACKING_ID',
          value: '',
          isSecret: true,
          description: 'Google Analytics tracking ID'
        }
      ]
    }
  };

  getTemplate(projectType: ProjectType): EnvTemplateResponseDto {
    return this.templates[projectType];
  }

  parseEnvFile(content: string): { key: string; value: string; isSecret: boolean; }[] {
    const lines = content.split('\n');
    const variables: { key: string; value: string; isSecret: boolean; }[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        const value = valueParts.join('=');
        if (key) {
          variables.push({
            key: key.trim(),
            value: value ? value.trim() : '',
            isSecret: this.isSecretVariable(key.trim())
          });
        }
      }
    }

    return variables;
  }

  private isSecretVariable(key: string): boolean {
    const secretKeywords = [
      'secret',
      'password',
      'token',
      'key',
      'auth',
      'credential',
      'private'
    ];
    return secretKeywords.some(keyword => 
      key.toLowerCase().includes(keyword.toLowerCase())
    );
  }
} 