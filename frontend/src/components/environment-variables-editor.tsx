import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { EnvironmentVariable } from '@/types/project';

interface Props {
  value: EnvironmentVariable[];
  onChange: (vars: EnvironmentVariable[]) => void;
}

export function EnvironmentVariablesEditor({ value, onChange }: Props) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isSecret, setIsSecret] = useState(false);

  const handleAdd = () => {
    if (!newKey || !newValue) return;
    onChange([...value, { key: newKey, value: newValue, isSecret }]);
    setNewKey('');
    setNewValue('');
    setIsSecret(false);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
        <Input
          placeholder="Key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
        />
        <Input
          placeholder="Value"
          value={newValue}
          type={isSecret ? 'password' : 'text'}
          onChange={(e) => setNewValue(e.target.value)}
        />
        <div className="flex items-center space-x-2">
          <Switch
            checked={isSecret}
            onCheckedChange={setIsSecret}
          />
          <span className="text-sm">Secret</span>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          disabled={!newKey || !newValue}
        >
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {value.map((variable, index) => (
          <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
            <Input value={variable.key} disabled />
            <Input
              value={variable.value}
              type={variable.isSecret ? 'password' : 'text'}
              disabled
            />
            <div className="flex items-center space-x-2">
              <Switch
                checked={variable.isSecret}
                disabled
              />
              <span className="text-sm">Secret</span>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleRemove(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
} 