
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Referrals from './pages/Referrals';
import PaymentCompletion from './pages/PaymentCompletions';
import Offers from './pages/Offers';
import Payments from './pages/Payments';
import Withdraw from './pages/Withdraw';
import { Redirect } from './pages/Redirect';

import { UserProvider } from './context/UserProvider';
import CompleteProfile from "./pages/CompleteProfile";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} /> {/* Landing page without SidebarProvider */}
            <Route path="/dashboard" element={<SidebarProvider><Dashboard /></SidebarProvider>} />
            <Route path="/r/:shortCode" element={<Redirect />} />
            <Route path="/payment-completion" element={<SidebarProvider><PaymentCompletion /></SidebarProvider>} />
            <Route path="/referrals" element={<SidebarProvider><Referrals /></SidebarProvider>} />
            <Route path="/offers" element={<SidebarProvider><Offers /></SidebarProvider>} />
            <Route path="/payments" element={<SidebarProvider><Payments /></SidebarProvider>} />
            <Route path="/withdraw" element={<SidebarProvider><Withdraw /></SidebarProvider>} />
            <Route path="/complete-profile" element={<SidebarProvider><CompleteProfile /></SidebarProvider>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster
        position="top-center"
        expand={true}
        richColors
        closeButton
        style={{
          marginTop: '20vh', // This pushes it more towards the middle
        }}
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

