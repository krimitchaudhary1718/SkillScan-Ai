import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/providers/SessionProvider';

/**
 * Root Layout
 *
 * Applies the Inter and Playfair Display fonts globally, wraps the app with NextAuth's
 * SessionProvider, and sets the classic light theme base classes.
 */

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata = {
  title: 'SkillScan AI - AI-Powered Interview Preparation',
  description:
    'Master your technical interviews with AI-powered resume analysis, mock interviews, skill assessments, and personalized learning roadmaps. Built for developers who want to land their dream tech job.',
  keywords: [
    'AI interview prep',
    'technical interview',
    'resume analysis',
    'mock interview',
    'skill assessment',
    'coding interview',
    'career preparation',
  ],
  authors: [{ name: 'SkillScan AI' }],
  openGraph: {
    title: 'SkillScan AI - AI-Powered Interview Preparation',
    description:
      'Master your technical interviews with AI-powered resume analysis, mock interviews, and personalized learning roadmaps.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full`}>
      <body className="min-h-full bg-[#FAFAFA] text-gray-900 antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
