import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useServers } from '@/hooks/use-servers';
import { ServerCreate } from './ServerCreate';

export function Servers() {
  const { servers, isLoading, error, refetch } = useServers();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleServerCreated = () => {
    refetch();
    toast({
      title: "Success",
      description: "Server created successfully"
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">Loading servers...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-5xl py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-destructive">Failed to load servers</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Servers</h1>
          <p className="text-muted-foreground">Manage your deployment servers</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          Add Server
        </Button>
      </div>

      {servers.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-muted-foreground">
              No servers added yet. Add your first server to get started.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {servers.map((server) => (
            <Card key={server.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{server.name}</CardTitle>
                    <CardDescription>{server.host}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      server.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-muted-foreground">
                      {server.status}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Connection Details</p>
                    <p className="text-sm text-muted-foreground">
                      {server.username}@{server.host}:{server.port}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Server Type</p>
                    <p className="text-sm text-muted-foreground">
                      {server.isBuildServer ? 'Build Server' : 'Deploy Server'}
                      {server.isSwarmManager && ' • Swarm Manager'}
                      {server.isSwarmWorker && ' • Swarm Worker'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServerCreate 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleServerCreated}
      />
    </div>
  );
} 