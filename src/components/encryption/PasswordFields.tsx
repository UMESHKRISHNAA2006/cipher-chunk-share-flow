
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PasswordFieldsProps {
  password: string;
  confirmPassword: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isProcessing: boolean;
}

export function PasswordFields({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  isProcessing
}: PasswordFieldsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={onPasswordChange}
          disabled={isProcessing}
          placeholder="Enter a strong password"
        />
      </div>
      
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={isProcessing}
          placeholder="Confirm your password"
        />
      </div>
    </div>
  );
}
