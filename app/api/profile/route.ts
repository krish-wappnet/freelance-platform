import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.config';
import { cloudinary } from '@/lib/cloudinary';

const profileUpdateSchema = z.object({
  // Personal Information
  name: z.string().min(2).optional(),
  phone: z.string().nullable().optional(),
  website: z.string().url().nullable().optional(),
  address: z.string().nullable().optional(),
  placeId: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),

  // Company Information
  companyName: z.string().nullable().optional(),
  companySize: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
  companyDescription: z.string().nullable().optional(),

  // Professional Information
  skills: z.array(z.string()).optional(),
  hourlyRate: z.number().nullable().optional(),
  experience: z.string().nullable().optional(),
  education: z.string().nullable().optional(),
  certifications: z.array(z.string()).optional(),
  portfolio: z.string().url().nullable().optional(),
  availability: z.string().nullable().optional(),
  languages: z.array(z.string()).optional(),
  preferredPaymentMethod: z.string().nullable().optional(),
  taxInformation: z.string().nullable().optional(),

  // Preferences
  theme: z.enum(['light', 'dark']).optional(),
  language: z.string().optional(),
  timezone: z.string().nullable().optional(),
  currency: z.string().optional(),

  // Notification Settings
  emailNotifications: z.boolean().optional(),
  projectUpdates: z.boolean().optional(),
  newMessages: z.boolean().optional(),
  paymentUpdates: z.boolean().optional(),

  // Security Settings
  twoFactorEnabled: z.boolean().optional(),
  loginNotifications: z.boolean().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        avatar: true,
        profileImage: true,
        location: true,
        skills: true,
        hourlyRate: true,
        phone: true,
        website: true,
        address: true,
        placeId: true,
        companyName: true,
        companySize: true,
        industry: true,
        companyDescription: true,
        theme: true,
        language: true,
        timezone: true,
        currency: true,
        emailNotifications: true,
        projectUpdates: true,
        newMessages: true,
        paymentUpdates: true,
        twoFactorEnabled: true,
        loginNotifications: true,
      },
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const profileData = formData.get('profileData') as string;

    let imageUrl = null;
    if (file) {
      // Convert file to base64
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64String = buffer.toString('base64');
      const dataURI = `data:${file.type};base64,${base64String}`;

      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          dataURI,
          {
            folder: 'profile_images',
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            resolve(result);
          }
        );
      });

      imageUrl = (result as any).secure_url;
    }

    // Parse and validate profile data
    const parsedData = JSON.parse(profileData);
    const validatedData = profileUpdateSchema.parse(parsedData);

    // Update profile with image URL if available
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...validatedData,
        profileImage: imageUrl || validatedData.profileImage,
      },
    });

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Error updating profile' },
      { status: 500 }
    );
  }
} 