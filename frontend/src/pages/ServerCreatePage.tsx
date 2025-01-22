import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServerCreate } from './ServerCreate';

export function ServerCreatePage() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      navigate('/servers');
    }
  };

  const handleSuccess = () => {
    navigate('/servers');
  };

  return (
    <ServerCreate
      open={isOpen}
      onOpenChange={handleOpenChange}
      onSuccess={handleSuccess}
    />
  );
} 