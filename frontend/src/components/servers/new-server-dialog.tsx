import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ServerForm } from './server-form';
import { useState } from 'react';

interface NewServerDialogProps {
  onSuccess?: () => void;
}

export function NewServerDialog({ onSuccess }: NewServerDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>New Server</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Server</DialogTitle>
        </DialogHeader>
        <ServerForm
          onSuccess={handleSuccess}
          onCancel={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 