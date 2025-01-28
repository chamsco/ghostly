import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, Box, Database, Container } from 'lucide-react';

export function NewResource() {
  const { projectId, environmentId } = useParams<{ projectId: string; environmentId: string }>();
  const navigate = useNavigate();

  const categories = [
    {
      title: 'Git Based',
      description: 'Deploy applications directly from Git repositories',
      items: [
        {
          id: 'public-repo',
          title: 'Public Repository',
          description: 'You can deploy any kind of public repositories from the supported git providers.',
          icon: <GitBranch className="h-8 w-8" />,
          path: `public`
        },
        {
          id: 'github-app',
          title: 'Private Repository (with GitHub App)',
          description: 'You can deploy public & private repositories through your GitHub Apps.',
          icon: <Box className="h-8 w-8" />,
          path: `github`
        },
        {
          id: 'deploy-key',
          title: 'Private Repository (with deploy key)',
          description: 'You can deploy public & private repositories with a simple deploy key (SSH key).',
          icon: <GitBranch className="h-8 w-8" />,
          path: `private`
        }
      ]
    },
    {
      title: 'Docker Based',
      description: 'Deploy applications using Docker',
      items: [
        {
          id: 'dockerfile',
          title: 'Dockerfile',
          description: 'You can deploy a simple Dockerfile, without Git.',
          icon: <Container className="h-8 w-8" />,
          path: `dockerfile`
        },
        {
          id: 'compose',
          title: 'Docker Compose',
          description: 'You can deploy a complex application easily with Docker Compose, without Git.',
          icon: <Container className="h-8 w-8" />,
          path: `compose`
        },
        {
          id: 'image',
          title: 'Existing Docker Image',
          description: 'You can deploy an existing Docker image from any Registry, without Git.',
          icon: <Container className="h-8 w-8" />,
          path: `image`
        }
      ]
    },
    {
      title: 'Databases',
      description: 'Deploy database instances',
      items: [
        {
          id: 'postgresql',
          title: 'PostgreSQL',
          description: 'PostgreSQL is an object-relational database known for its robustness, advanced features, and strong standards compliance.',
          icon: <Database className="h-8 w-8" />,
          path: `postgresql`
        },
        {
          id: 'redis',
          title: 'Redis',
          description: 'Redis is an open-source, in-memory data structure store, used as a database, cache, and message broker.',
          icon: <Database className="h-8 w-8" />,
          path: `redis`
        },
        {
          id: 'mongodb',
          title: 'MongoDB',
          description: 'MongoDB is a source-available, NoSQL database that uses JSON-like documents with optional schemas.',
          icon: <Database className="h-8 w-8" />,
          path: `mongodb`
        }
      ]
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Resource</h1>
        <p className="text-muted-foreground">
          Deploy resources, like Applications, Databases, Services...
        </p>
      </div>

      {categories.map((category) => (
        <div key={category.title} className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">{category.title}</h2>
            <p className="text-muted-foreground">{category.description}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <Card 
                key={item.id}
                className="hover:border-primary cursor-pointer transition-colors"
                onClick={() => {
                  console.log(`Navigating to ${item.path} resource creation`, { projectId, environmentId });
                  navigate(`/projects/${projectId}/environments/${environmentId}/new/${item.path}`);
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-4">
                    {item.icon}
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 
