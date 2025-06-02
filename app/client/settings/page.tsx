'use client'

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/client-auth';
import { useTheme } from 'next-themes';
import { AddressInput } from '@/components/ui/address-input';
import {
  Bell,
  Lock,
  Mail,
  Phone,
  User,
  Globe,
  Shield,
  CreditCard,
  Palette,
  Languages,
  Building2,
  Briefcase,
  MapPin,
  Upload,
  Save,
  Loader2,
  GraduationCap,
  Award,
  FileText,
  Calendar,
  Trash2,
} from 'lucide-react';
import { ImageUpload } from '@/components/ui/image-upload';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    bio: '',
    address: '',
    placeId: '',
    companyName: '',
    companySize: '',
    industry: '',
    companyDescription: '',
    theme: 'light',
    language: 'en',
    timezone: '',
    currency: 'USD',
    emailNotifications: true,
    projectUpdates: true,
    newMessages: true,
    paymentUpdates: true,
    twoFactorEnabled: false,
    loginNotifications: true,
    avatar: '',
    profileImage: '',
  });

  // Add state for address components
  const [addressComponents, setAddressComponents] = useState({
    address: '',
    state: '',
    country: '',
    placeId: '',
  });

  const [isUploading, setIsUploading] = useState(false);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            setFormData(prev => ({
              ...prev,
              ...data.profile,
            }));

            // Parse address components
            if (data.profile.address) {
              const addressParts = data.profile.address.split(',');
              const state = addressParts[addressParts.length - 2]?.trim() || '';
              const country = addressParts[addressParts.length - 1]?.trim() || '';
              const address = addressParts.slice(0, -2).join(',').trim();

              setAddressComponents({
                address,
                state,
                country,
                placeId: data.profile.placeId || '',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user, toast]);

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('profileData', JSON.stringify(formData));

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        body: formDataToSend,
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add password change logic here
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
    setFormData(prev => ({
      ...prev,
      theme: checked ? 'dark' : 'light',
    }));
    toast({
      title: "Theme updated",
      description: `Switched to ${checked ? 'dark' : 'light'} mode.`,
    });
  };

  const handleAddressChange = (address: string, placeId: string, state: string, country: string) => {
    const fullAddress = `${address}, ${state}, ${country}`;
    setFormData(prev => ({
      ...prev,
      address: fullAddress,
      placeId,
    }));
    setAddressComponents({
      address,
      state,
      country,
      placeId,
    });
  };

  const handleImageUpload = async (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      profileImage: imageUrl
    }));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6 md:space-y-8">
        <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex h-auto p-1 bg-muted/50 rounded-lg w-auto min-w-full md:min-w-[500px] md:w-[500px]">
            <TabsTrigger 
              value="profile" 
              className="flex-1 md:flex-none data-[state=active]:bg-background py-3 px-4 text-sm md:text-base rounded-md flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex-1 md:flex-none data-[state=active]:bg-background py-3 px-4 text-sm md:text-base rounded-md flex items-center justify-center gap-2"
            >
              <Shield className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex-1 md:flex-none data-[state=active]:bg-background py-3 px-4 text-sm md:text-base rounded-md flex items-center justify-center gap-2"
            >
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Notif</span>
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="flex-1 md:flex-none data-[state=active]:bg-background py-3 px-4 text-sm md:text-base rounded-md flex items-center justify-center gap-2"
            >
              <Palette className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Prefs</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6 md:space-y-8">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1 p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl">Profile Information</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Update your profile information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 p-4 md:p-6 bg-muted/30 rounded-lg border border-border/50">
                  <div className="relative group mx-auto md:mx-0">
                    <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-lg transition-transform duration-200 group-hover:scale-105">
                      <AvatarImage src={formData.profileImage || undefined} alt={formData.name || 'User'} />
                      <AvatarFallback className="text-2xl md:text-3xl bg-primary/10">{formData.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    {isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                        <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 w-full md:w-auto">
                    <div className="space-y-1 text-center md:text-left">
                      <h3 className="text-base md:text-lg font-medium">Profile Picture</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        Upload a professional photo to help others recognize you.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2 w-full sm:w-auto"
                        type="button"
                        onClick={() => document.getElementById('avatar-upload')?.click()}
                        disabled={isUploading}
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
                      {formData.profileImage && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2 text-destructive hover:text-destructive/90 w-full sm:w-auto"
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, profileImage: '' }));
                            toast({
                              title: "Avatar removed",
                              description: "Your profile picture has been removed.",
                            });
                          }}
                          disabled={isUploading}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground text-center md:text-left">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-base md:text-lg font-medium">Personal Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="name" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="email" 
                            type="email" 
                            value={formData.email}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="phone" 
                            type="tel" 
                            placeholder="+1 (555) 000-0000"
                            value={formData.phone}
                            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="website" 
                            type="url" 
                            placeholder="https://example.com"
                            value={formData.website}
                            onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-base md:text-lg font-medium">Company Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="companyName" 
                            placeholder="Enter your company name"
                            value={formData.companyName}
                            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size</Label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="companySize" 
                            placeholder="e.g., 1-10, 11-50, 51-200"
                            value={formData.companySize}
                            onChange={(e) => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="industry" 
                            placeholder="e.g., Technology, Healthcare, Finance"
                            value={formData.industry}
                            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                          />
                        </div>
                      </div>

                      <AddressInput
                        value={addressComponents.address}
                        state={addressComponents.state}
                        country={addressComponents.country}
                        onChange={(address, placeId, state, country) => handleAddressChange(address, placeId, state, country)}
                        label="Company Address"
                        placeholder="Enter your company address"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-base md:text-lg font-medium">About</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          placeholder="Tell us about yourself"
                          className="min-h-[120px] resize-none"
                          value={formData.bio}
                          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyDescription">Company Description</Label>
                        <Textarea
                          id="companyDescription"
                          placeholder="Tell us about your company"
                          className="min-h-[120px] resize-none"
                          value={formData.companyDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, companyDescription: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl">Security Settings</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Input id="current-password" type="password" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Input id="new-password" type="password" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone logs into your account.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Updating...' : 'Update Security Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl">Notification Preferences</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Project Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about project status changes.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>New Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Payment Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payment status changes.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-xl md:text-2xl">Preferences</CardTitle>
              <CardDescription className="text-sm md:text-base">
                Customize your experience on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Switch between light and dark themes.
                      </p>
                    </div>
                    <Switch
                      checked={theme === 'dark'}
                      onCheckedChange={handleThemeChange}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Language</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred language.
                      </p>
                    </div>
                    <select className="h-9 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Time Zone</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your local time zone.
                      </p>
                    </div>
                    <select className="h-9 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="utc">UTC</option>
                      <option value="est">EST</option>
                      <option value="pst">PST</option>
                    </select>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label>Currency</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your preferred currency.
                      </p>
                    </div>
                    <select className="h-9 w-full sm:w-[200px] rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <Button disabled={isLoading} className="w-full sm:w-auto">
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 