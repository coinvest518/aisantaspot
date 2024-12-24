// components/Layout.tsx
import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { useUser } from '@/lib/useUser';
import { Navigate } from 'react-router-dom';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useUser();
  const { state } = useSidebar();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40">
        <AppSidebar />
      </div>
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          state === "expanded" ? "ml-64" : "ml-16",
          "p-6"
        )}
      >
        {children}
      </main>
    </div>
  );
};