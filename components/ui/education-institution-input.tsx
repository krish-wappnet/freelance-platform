'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap } from 'lucide-react'; // Using GraduationCap icon
import { cn } from '@/lib/utils';

// Removed declare global for window.google

interface EducationInstitutionInputProps {
  value?: string;
  // Modified onChange to only provide the input value (string)
  onChange?: (name: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function EducationInstitutionInput({
  value,
  onChange,
  label = 'Educational Institution',
  placeholder = 'Enter college or university name',
  className,
}: EducationInstitutionInputProps) {
  // Removed inputRef and autocomplete state
  const [inputValue, setInputValue] = useState(value || '');
  // Removed isFetchingSuggestions state

  // Removed useEffect for script loading and autocomplete initialization
  // Removed initializeAutocomplete function

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    // Call onChange with the current input value
    if (onChange) {
      onChange(newValue);
    }
  };

  // Keep the input value in sync with the controlled prop 'value'
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Removed useEffect for hiding loading indicator

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="relative group">
        <GraduationCap className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          // Removed ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn(
            "pl-9 w-full transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20",
            "placeholder:text-muted-foreground/50"
          )}
        />
        {/* Removed conditional rendering for loading indicator */}
      </div>
    </div>
  );
} 