import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ServerForm } from './server-form';

interface NewServerDialogProps {
  onSuccess?: () => void;
}

export function NewServerDialog({ onSuccess }: NewServerDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Server</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Server</DialogTitle>
          <DialogDescription>
            Add a new server for deployment. Make sure you have SSH access to the server.
          </DialogDescription>
        </DialogHeader>
        <ServerForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
} 