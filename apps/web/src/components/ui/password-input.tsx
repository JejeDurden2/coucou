'use client';

import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './input';

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative">
        <Input ref={ref} type={visible ? 'text' : 'password'} className="pr-10" {...props} />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);

interface PasswordRequirementProps {
  met: boolean;
  text: string;
}

export function PasswordRequirement({ met, text }: PasswordRequirementProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <div className={`size-1.5 rounded-full ${met ? 'bg-success' : 'bg-muted-foreground/30'}`} />
      <span className={met ? 'text-success' : 'text-muted-foreground'}>{text}</span>
    </div>
  );
}

export function usePasswordValidation(password: string) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  return { hasMinLength, hasUppercase, hasLowercase, hasNumber, isValid };
}
