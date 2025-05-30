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
import { EducationInstitutionInput } from '@/components/ui/education-institution-input';
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
  Briefcase,
  GraduationCap,
  Award,
  MapPin,
  Upload,
  Save,
  Loader2,
  Trash2,
} from 'lucide-react';

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
    skills: [] as string[],
    hourlyRate: 0,
    experience: '',
    collegeName: '',
    degreeName: '',
    avatar: '',
  });
  const [certificationFiles, setCertificationFiles] = useState<File[]>([]);
  const [addressComponents, setAddressComponents] = useState({
    address: '',
    state: '',
    country: '',
    placeId: '',
  });

  // Fetch profile data
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
      const dataToSend = {
        ...formData,
        skills: formData.skills,
        hourlyRate: Number(formData.hourlyRate),
      };

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
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

  const handleCollegeNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      collegeName: name,
    }));
  };

  const handleCertificationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setCertificationFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
    }
  };

  const removeCertificationFile = (index: number) => {
    setCertificationFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="container max-w-6xl py-6 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-muted/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background">Profile</TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-background">Security</TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background">Notifications</TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-background">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8">
          <Card className="border-none shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Profile Information</CardTitle>
              <CardDescription>
                Update your profile information and how others see you on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-8">
                <div className="flex items-center gap-8 p-4 bg-muted/30 rounded-lg">
                  <Avatar className="h-24 w-24 border-4 border-background">
                    <AvatarImage src={user?.avatar || undefined} alt={user?.name || 'User'} />
                    <AvatarFallback className="text-2xl">{user?.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Change Avatar
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, GIF or PNG. Max size of 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Personal Information</h3>
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
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    <h3 className="text-lg font-medium">Professional Information</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="hourlyRate"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Enter your hourly rate"
                            value={formData.hourlyRate}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              hourlyRate: Number(e.target.value) 
                            }))}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="skills">Skills</Label>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="skills"
                            placeholder="e.g., React, Node.js, UI/UX"
                            value={formData.skills.join(', ')}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                            }))}
                          />
                        </div>
                      </div>

                      <AddressInput
                        value={addressComponents.address}
                        state={addressComponents.state}
                        country={addressComponents.country}
                        onChange={(address, placeId, state, country) => handleAddressChange(address, placeId, state, country)}
                        label="Address"
                        placeholder="Enter your address"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-medium">About</h3>
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

                       <div className="space-y-2">
                         <Label htmlFor="experience">Experience</Label>
                         <div className="flex items-center gap-2">
                           <Briefcase className="h-4 w-4 text-muted-foreground" />
                           <Textarea
                             id="experience"
                             placeholder="Describe your work experience"
                             className="min-h-[120px] resize-none"
                             value={formData.experience}
                             onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                           />
                         </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <EducationInstitutionInput
                         value={formData.collegeName}
                         onChange={handleCollegeNameChange}
                         label="College / University"
                         placeholder="Enter college or university name"
                       />

                       <div className="space-y-2">
                         <Label htmlFor="degreeName">Degree Name</Label>
                         <div className="flex items-center gap-2">
                           <GraduationCap className="h-4 w-4 text-muted-foreground" />
                           <Input
                             id="degreeName"
                             placeholder="e.g., Bachelor of Science"
                             value={formData.degreeName}
                             onChange={(e) => setFormData(prev => ({ ...prev, degreeName: e.target.value }))}
                             className="h-10"
                           />
                         </div>
                       </div>

                       <div className="space-y-2">
                          <Label htmlFor="certificationUpload">Certifications</Label>
                           <div className="flex items-center gap-2">
                             <Award className="h-4 w-4 text-muted-foreground" />
                             <Input
                               id="certificationUpload"
                               type="file"
                               multiple
                               onChange={handleCertificationUpload}
                               className="h-10 file:h-8 file:text-sm file:bg-muted file:border-none file:rounded-md file:px-3 file:mr-2"
                             />
                           </div>
                           {certificationFiles.length > 0 && (
                             <div className="mt-2 space-y-1">
                               <p className="text-sm font-medium">Uploaded Files:</p>
                               {certificationFiles.map((file, index) => (
                                 <div key={index} className="flex items-center justify-between text-sm text-muted-foreground">
                                   <span>{file.name}</span>
                                   <Button
                                     variant="ghost"
                                     size="sm"
                                     onClick={() => removeCertificationFile(index)}
                                     className="text-destructive hover:text-destructive/90 p-1 h-auto"
                                   >
                                     <Trash2 className="h-3 w-3" />
                                   </Button>
                                 </div>
                               ))}
                             </div>
                           )}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading} size="lg" className="gap-2">
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
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account.
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Login Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when someone logs into your account.
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update Security Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Project Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about project status changes.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications for new messages.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Payment Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about payment status changes.
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <Button disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience on the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
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

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Language</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred language.
                      </p>
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Time Zone</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your local time zone.
                      </p>
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="utc">UTC</option>
                      <option value="est">EST</option>
                      <option value="pst">PST</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Currency</Label>
                      <p className="text-sm text-muted-foreground">
                        Set your preferred currency.
                      </p>
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="usd">USD ($)</option>
                      <option value="eur">EUR (€)</option>
                      <option value="gbp">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <Button disabled={isLoading}>
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