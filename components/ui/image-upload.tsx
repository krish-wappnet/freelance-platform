'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageUpload: (imageUrl: string) => void;
  name?: string;
}

export function ImageUpload({ currentImage, onImageUpload, name = 'User' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, or GIF).",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('profileData', JSON.stringify({ profileImage: currentImage }));

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onImageUpload(data.profile.profileImage);
      
      toast({
        title: "Success",
        description: "Profile image uploaded successfully.",
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-8 p-4 bg-muted/30 rounded-lg">
      <Avatar className="h-24 w-24 border-4 border-background">
        <AvatarImage src={currentImage || undefined} alt={name} />
        <AvatarFallback className="text-2xl">{name[0] || 'U'}</AvatarFallback>
      </Avatar>
      <div className="space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isUploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Change Avatar
            </>
          )}
        </Button>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-sm text-muted-foreground">
          JPG, GIF or PNG. Max size of 2MB.
        </p>
      </div>
    </div>
  );
} 