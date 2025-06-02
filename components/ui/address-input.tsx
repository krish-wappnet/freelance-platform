'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
    googleMapsLoaded: boolean;
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google || autocomplete) return;

    const autocompleteInstance = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      fields: ['formatted_address', 'place_id', 'address_components'],
      componentRestrictions: { country: [] }, // Allow all countries
    });

    // Prevent form submission on enter
    inputRef.current.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    });

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      
      if (!place.formatted_address) {
        return;
      }

      const formattedAddress = place.formatted_address;
      let stateName = '';
      let countryName = '';
      
      // Extract state and country from address components
      place.address_components?.forEach((component: any) => {
        const types = component.types;
        if (types.includes('administrative_area_level_1')) {
          stateName = component.long_name;
        }
        if (types.includes('country')) {
          countryName = component.long_name;
        }
      });

      // Update all states at once to prevent flickering
      setInputValue(formattedAddress);
      setState(stateName);
      setCountry(countryName);
      setSelectedPlaceId(place.place_id);

      // Call onChange with all the updated values
      if (onChange) {
        onChange(formattedAddress, place.place_id, stateName, countryName);
      }
    });

    setAutocomplete(autocompleteInstance);
  }, [onChange, autocomplete]);

  const loadGoogleMapsScript = useCallback(() => {
    if (window.googleMapsLoaded) {
      initializeAutocomplete();
      return;
    }

    setIsLoading(true);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.googleMapsLoaded = true;
      setIsLoading(false);
      initializeAutocomplete();
    };
    document.head.appendChild(script);
  }, [initializeAutocomplete]);

  useEffect(() => {
    loadGoogleMapsScript();

    return () => {
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };
  }, [loadGoogleMapsScript, autocomplete]);

  // Update state and country from props only if they're different
  useEffect(() => {
    if (initialState !== state) {
      setState(initialState || '');
    }
    if (initialCountry !== country) {
      setCountry(initialCountry || '');
    }
  }, [initialState, initialCountry]);

  // Update input value from props only if it's different and no place is selected
  useEffect(() => {
    if (value && value !== inputValue && !selectedPlaceId) {
      setInputValue(value);
    }
  }, [value, inputValue, selectedPlaceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Clear selection only if user manually types something different
    if (selectedPlaceId && newValue !== inputValue) {
      setSelectedPlaceId(null);
      setState('');
      setCountry('');
      if (onChange) {
        onChange('', '', '', '');
      }
    }
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
            placeholder={isLoading ? "Loading..." : placeholder}
            disabled={isLoading}
            className={cn(
              "pl-9 w-full transition-all duration-200",
              "focus:ring-2 focus:ring-primary/20",
              "placeholder:text-muted-foreground/50",
              isLoading && "opacity-50"
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