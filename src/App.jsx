import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import ProjectDetail from "./pages/ProjectDetail";
import SubmitProject from "./pages/SubmitProject";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import KnowledgeGraph from "./pages/KnowledgeGraph";

import ProtectedRoute from "@/components/ProtectedRoute";
import FacultyRegister from "./pages/FacultyRegister";
import FacultyLogin from "./pages/FacultyLogin";
import InstitutionLogin from "./pages/InstitutionLogin";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";

const AppRoutes = () => {
  const location = useLocation();
  const hideNavbar = [
    '/login',
    '/register',
    '/faculty/login',
    '/faculty/register',
    '/faculty/dashboard',
    '/institution/login',
    '/institution/dashboard'
  ].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>

        {/* Public / Auth Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/faculty/register" element={<FacultyRegister />} />
        <Route path="/faculty/login" element={<FacultyLogin />} />
        <Route path="/institution/login" element={<InstitutionLogin />} />

        {/* Protected Portal Routes */}
        <Route path="/browse" element={<ProtectedRoute><Browse /></ProtectedRoute>} />
        <Route path="/project/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
        <Route path="/submit" element={<ProtectedRoute><SubmitProject /></ProtectedRoute>} />
        <Route path="/graph" element={<ProtectedRoute><KnowledgeGraph /></ProtectedRoute>} />
        <Route path="/faculty/dashboard" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
        <Route path="/institution/dashboard" element={<ProtectedRoute><InstitutionDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
