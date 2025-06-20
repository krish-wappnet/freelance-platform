'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    google: any;
    googleMapsLoaded: boolean;
    initGoogleMaps: () => void;
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

// Cache for script loading state
let scriptLoadingPromise: Promise<void> | null = null;

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
  const autocompleteRef = useRef<any>(null);
  const [inputValue, setInputValue] = useState(value || '');
  const [state, setState] = useState(initialState || '');
  const [country, setCountry] = useState(initialCountry || '');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [isManuallyEditing, setIsManuallyEditing] = useState(false);

  // Memoize the autocomplete options
  const autocompleteOptions = useMemo(() => ({
    types: ['address'],
    fields: ['formatted_address', 'place_id', 'address_components'],
    componentRestrictions: { country: [] },
  }), []);

  const loadGoogleMapsScript = useCallback(() => {
    if (window.googleMapsLoaded) {
      return Promise.resolve();
    }

    if (scriptLoadingPromise) {
      return scriptLoadingPromise;
    }

    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      return new Promise<void>((resolve) => {
        const checkLoaded = setInterval(() => {
          if (window.googleMapsLoaded) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 100);
      });
    }

    setIsLoading(true);

    scriptLoadingPromise = new Promise((resolve, reject) => {
      window.initGoogleMaps = () => {
        window.googleMapsLoaded = true;
        setIsLoading(false);
        resolve();
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        setIsLoading(false);
        reject(new Error('Failed to load Google Maps script'));
      };

      document.head.appendChild(script);
    });

    return scriptLoadingPromise;
  }, []);

  const initializeAutocomplete = useCallback(() => {
    if (!inputRef.current || !window.google || !window.googleMapsLoaded) {
      return;
    }

    try {
      // Clear existing instance if any
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }

      const autocompleteInstance = new window.google.maps.places.Autocomplete(
        inputRef.current,
        autocompleteOptions
      );

      const preventSubmit = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          e.preventDefault();
        }
      };

      inputRef.current.addEventListener('keydown', preventSubmit);

      autocompleteInstance.addListener('place_changed', () => {
        try {
          const place = autocompleteInstance.getPlace();
          
          if (!place.formatted_address) {
            return;
          }

          const formattedAddress = place.formatted_address;
          let stateName = '';
          let countryName = '';
          
          place.address_components?.forEach((component: any) => {
            const types = component.types;
            if (types.includes('administrative_area_level_1')) {
              stateName = component.long_name;
            }
            if (types.includes('country')) {
              countryName = component.long_name;
            }
          });

          // Batch state updates
          requestAnimationFrame(() => {
            setInputValue(formattedAddress);
            setState(stateName);
            setCountry(countryName);
            setSelectedPlaceId(place.place_id);
            setIsManuallyEditing(false);

            if (onChange) {
              onChange(formattedAddress, place.place_id, stateName, countryName);
            }
          });
        } catch (error) {
          console.error('Error handling place selection:', error);
        }
      });

      autocompleteRef.current = autocompleteInstance;

      return () => {
        if (inputRef.current) {
          inputRef.current.removeEventListener('keydown', preventSubmit);
        }
        if (autocompleteInstance) {
          window.google.maps.event.clearInstanceListeners(autocompleteInstance);
        }
      };
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  }, [onChange, autocompleteOptions]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      try {
        await loadGoogleMapsScript();
        cleanup = initializeAutocomplete();
      } catch (error) {
        console.error('Error initializing address input:', error);
      }
    };

    init();

    return () => {
      if (cleanup) cleanup();
    };
  }, [loadGoogleMapsScript, initializeAutocomplete]);

  // Update state and country from props only if not manually editing
  useEffect(() => {
    if (!isManuallyEditing) {
      if (initialState !== state) {
        setState(initialState || '');
      }
      if (initialCountry !== country) {
        setCountry(initialCountry || '');
      }
    }
  }, [initialState, initialCountry, isManuallyEditing]);

  // Update input value from props only if not manually editing
  useEffect(() => {
    if (!isManuallyEditing && value && value !== inputValue) {
      setInputValue(value);
    }
  }, [value, inputValue, isManuallyEditing]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsManuallyEditing(true);

    if (newValue === '') {
      requestAnimationFrame(() => {
        setSelectedPlaceId(null);
        setState('');
        setCountry('');
        if (onChange) {
          onChange('', '', '', '');
        }
      });
    }
  }, [onChange]);

  const handleInputBlur = useCallback(() => {
    setTimeout(() => {
      setIsManuallyEditing(false);
    }, 200);
  }, []);

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
            onBlur={handleInputBlur}
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