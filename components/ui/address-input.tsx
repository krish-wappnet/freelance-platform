'use client';

import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
  }
}

interface AddressInputProps {
  value?: string;
  state?: string;
  country?: string;
  onChange?: (address: string, placeId: string, state: string, country: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function AddressInput({
  value,
  state: initialState,
  country: initialCountry,
  onChange,
  label = 'Address',
  placeholder = 'Enter your address',
  className,
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [autocomplete, setAutocomplete] = useState<any>(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [state, setState] = useState(initialState || '');
  const [country, setCountry] = useState(initialCountry || '');

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    } else {
      initializeAutocomplete();
    }

    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, []);

  useEffect(() => {
    if (initialState) setState(initialState);
    if (initialCountry) setCountry(initialCountry);
  }, [initialState, initialCountry]);

  useEffect(() => {
    if (value) setInputValue(value);
  }, [value]);

  const initializeAutocomplete = () => {
    if (inputRef.current && window.google) {
      const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        fields: ['formatted_address', 'place_id', 'address_components'],
      });

      // Remove Google branding
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        pacContainer.setAttribute('style', 'display: none !important');
      }

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        if (place.formatted_address && onChange) {
          setInputValue(place.formatted_address);
          
          // Extract state and country from address components
          let stateName = '';
          let countryName = '';
          
          place.address_components?.forEach((component: any) => {
            if (component.types.includes('administrative_area_level_1')) {
              stateName = component.long_name;
            }
            if (component.types.includes('country')) {
              countryName = component.long_name;
            }
          });

          setState(stateName);
          setCountry(countryName);
          onChange(place.formatted_address, place.place_id, stateName, countryName);
        }
      });

      setAutocomplete(autocompleteInstance);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="relative group">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            ref={inputRef}
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">State/Province</Label>
          <Input
            type="text"
            value={state}
            readOnly
            className="bg-muted/50"
            placeholder="State will be auto-filled"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Country</Label>
          <Input
            type="text"
            value={country}
            readOnly
            className="bg-muted/50"
            placeholder="Country will be auto-filled"
          />
        </div>
      </div>
    </div>
  );
} 