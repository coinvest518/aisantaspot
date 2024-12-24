import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from './context/UserProvider';
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
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/r/:shortCode" element={<Redirect />} />

            {/* Protected routes with sidebar layout */}
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/payment-completion" element={
              <Layout>
                <PaymentCompletion />
              </Layout>
            } />
            <Route path="/referrals" element={
              <Layout>
                <Referrals />
              </Layout>
            } />
            <Route path="/offers" element={
              <Layout>
                <Offers />
              </Layout>
            } />
            <Route path="/payments" element={
              <Layout>
                <Payments />
              </Layout>
            } />
            <Route path="/withdraw" element={
              <Layout>
                <Withdraw />
              </Layout>
            } />
            <Route path="/complete-profile" element={
              <Layout>
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
    </UserProvider>
  </QueryClientProvider>
);

export default App;