import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from './context/UserProvider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Layout } from './components/Layout';
import { Toaster } from "sonner";

// Page imports
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Referrals from './pages/Referrals';
import PaymentCompletion from './pages/PaymentCompletion';
import Offers from './pages/Offers';
import Payments from './pages/Payments';
import Withdraw from './pages/Withdraw';
import { Redirect } from './pages/Redirect';
import CompleteProfile from "./pages/CompleteProfile";
import { Analytics } from "@vercel/analytics/react"
import CryptoPaymentPage from './pages/CryptoPayment';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <SidebarProvider defaultOpen={true}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes - no layout */}
              <Route path="/" element={<Landing />} />
              <Route path="/r/:shortCode" element={<Redirect />} />

              {/* Protected routes with layout */}
              <Route path="/dashboard" element={
                <Layout requireAuth>
                  <Dashboard />
                </Layout>
              } />
              <Route path="/crypto-payment" element={
                <Layout requireAuth>
                  <CryptoPaymentPage />
                </Layout> 
                }/>

            <Route path="/payment-completion" element={
              <Layout requireAuth>
                <PaymentCompletion />
              </Layout>
            } />
            <Route path="/referrals" element={
              <Layout requireAuth>
                <Referrals />
              </Layout>
            } />
            <Route path="/offers" element={
              <Layout requireAuth>
                <Offers />
              </Layout>
            } />
            <Route path="/payments" element={
              <Layout requireAuth>
                <Payments />
              </Layout>
            } />
            <Route path="/withdraw" element={
              <Layout requireAuth>
                <Withdraw />
              </Layout>
            } />
            <Route path="/complete-profile" element={
              <Layout requireAuth>
                <CompleteProfile />
              </Layout>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>

      <Toaster
        position="top-center"
        expand={true}
        richColors
        closeButton
        style={{ marginTop: '20vh' }}
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '1.1rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      />
      <Analytics />

    </SidebarProvider>
  </UserProvider>
  </QueryClientProvider >
);

export default App;