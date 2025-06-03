# Freelance Platform

A modern, full-stack freelance marketplace platform built with Next.js 13, featuring a beautiful UI powered by Tailwind CSS and Radix UI components.

## 🌟 Features

- **Authentication & Authorization**
  - Secure user authentication system
  - Role-based access control (Freelancer/Client)
  - JWT-based authentication with Next-Auth

- **Dashboard**
  - Personalized dashboards for both freelancers and clients
  - Project management interface
  - Real-time statistics and analytics

- **Project Management**
  - Project creation and management
  - Milestone tracking
  - Contract management
  - Invoice generation (PDF support)

- **Payment Integration**
  - Secure payment processing with Stripe
  - Milestone-based payments
  - Invoice generation and tracking

- **User Profiles**
  - Detailed freelancer and client profiles
  - Portfolio management
  - Skill showcasing

## 🚀 Tech Stack

- **Frontend**
  - Next.js 13 (React)
  - TypeScript
  - Tailwind CSS
  - Radix UI Components
  - React Hook Form
  - Zod Validation

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL Database
  - Stripe Payment Integration
  - JWT Authentication

- **Development Tools**
  - ESLint
  - TypeScript
  - Prettier
  - Prisma Studio

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_SECRET="your-nextauth-secret"
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
   CLOUDINARY_API_KEY="your-cloudinary-api-key"
   CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
├── app/                    # Next.js 13 app directory
│   ├── api/               # API routes
│   ├── components/        # Shared components
│   ├── dashboard/         # Dashboard pages
│   ├── freelancer/        # Freelancer specific pages
│   ├── client/           # Client specific pages
│   └── ...               # Other app routes
├── components/            # Reusable UI components
├── contexts/             # React Context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
├── prisma/              # Database schema and migrations
└── types/               # TypeScript type definitions
```

## 🔒 Security Features

- Secure authentication with Next-Auth
- JWT token-based session management
- Password hashing with bcrypt
- Input validation and sanitization
- Protected API routes
- Secure payment processing

## 🎨 UI/UX Features

- Responsive design for all devices
- Dark/Light theme support
- Modern and clean interface
- Interactive components
- Toast notifications
- Loading states and animations
- Form validation feedback

## 📝 API Documentation

The API documentation is available at `/api-docs` when running the development server. It includes:
- Detailed endpoint descriptions
- Request/Response examples
- Authentication requirements
- API status codes

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting solutions

