import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Questionnaire from "./pages/Questionnaire";
import Admin from "./pages/Admin";
import PatientDetails from "./pages/PatientDetails";
import Cartilhas from "./pages/Cartilhas";
import ViewCartilha from "./pages/ViewCartilha";
import AdminCartilhas from "./pages/AdminCartilhas";
import AdminEbooks from "./pages/AdminEbooks";
import AdminPartners from "./pages/AdminPartners";
import AdminPayment from "./pages/AdminPayment";
import AdminLocation from "./pages/AdminLocation";
import AdminAppointments from "./pages/AdminAppointments";
import AdminSatisfaction from "./pages/AdminSatisfaction";
import AdminGifts from "./pages/AdminGifts";
import AdminExamResults from "./pages/AdminExamResults";
import AdminExamOrders from "./pages/AdminExamOrders";
import AdminPrescriptions from "./pages/AdminPrescriptions";
import AdminClinicSettings from "./pages/AdminClinicSettings";
import AdminQuestionarios from "./pages/AdminQuestionarios";
import Gifts from "./pages/Gifts";
import Partners from "./pages/Partners";
import Payment from "./pages/Payment";
import Location from "./pages/Location";
import Appointments from "./pages/Appointments";
import Ebooks from "./pages/Ebooks";
import ViewEbook from "./pages/ViewEbook";
import Satisfaction from "./pages/Satisfaction";
import ExamResults from "./pages/ExamResults";
import ExamOrders from "./pages/ExamOrders";
import Prescriptions from "./pages/Prescriptions";
import ScheduleAppointment from "./pages/ScheduleAppointment";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-azul-claro to-rosa-bebe rounded-full animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/questionnaire" element={
              <ProtectedRoute>
                <Questionnaire />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } />
            <Route path="/admin/patient/:id" element={
              <AdminRoute>
                <PatientDetails />
              </AdminRoute>
            } />
            <Route path="/cartilhas" element={
              <ProtectedRoute>
                <Cartilhas />
              </ProtectedRoute>
            } />
            <Route path="/cartilhas/:id" element={
              <ProtectedRoute>
                <ViewCartilha />
              </ProtectedRoute>
            } />
            <Route path="/partners" element={
              <ProtectedRoute>
                <Partners />
              </ProtectedRoute>
            } />
            <Route path="/payment" element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            } />
            <Route path="/location" element={
              <ProtectedRoute>
                <Location />
              </ProtectedRoute>
            } />
            <Route path="/appointments" element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            } />
            <Route path="/ebooks" element={
              <ProtectedRoute>
                <Ebooks />
              </ProtectedRoute>
            } />
            <Route path="/ebooks/:id" element={
              <ProtectedRoute>
                <ViewEbook />
              </ProtectedRoute>
            } />
            <Route path="/satisfaction" element={
              <ProtectedRoute>
                <Satisfaction />
              </ProtectedRoute>
            } />
            <Route path="/admin/cartilhas" element={
              <AdminRoute>
                <AdminCartilhas />
              </AdminRoute>
            } />
            <Route path="/admin/ebooks" element={
              <AdminRoute>
                <AdminEbooks />
              </AdminRoute>
            } />
            <Route path="/admin/partners" element={
              <AdminRoute>
                <AdminPartners />
              </AdminRoute>
            } />
            <Route path="/admin/payment" element={
              <AdminRoute>
                <AdminPayment />
              </AdminRoute>
            } />
            <Route path="/admin/location" element={
              <AdminRoute>
                <AdminLocation />
              </AdminRoute>
            } />
            <Route path="/admin/appointments" element={
              <AdminRoute>
                <AdminAppointments />
              </AdminRoute>
            } />
            <Route path="/admin/satisfaction" element={
              <AdminRoute>
                <AdminSatisfaction />
              </AdminRoute>
            } />
            <Route path="/admin/gifts" element={
              <AdminRoute>
                <AdminGifts />
              </AdminRoute>
            } />
            <Route path="/admin/exam-results" element={
              <AdminRoute>
                <AdminExamResults />
              </AdminRoute>
            } />
            <Route path="/admin/clinic-settings" element={
              <AdminRoute>
                <AdminClinicSettings />
              </AdminRoute>
            } />
            <Route path="/admin/questionarios" element={
              <AdminRoute>
                <AdminQuestionarios />
              </AdminRoute>
            } />
            <Route path="/gifts" element={
              <ProtectedRoute>
                <Gifts />
              </ProtectedRoute>
            } />
            <Route path="/exam-results" element={
              <ProtectedRoute>
                <ExamResults />
              </ProtectedRoute>
            } />
            <Route path="/schedule" element={
              <ProtectedRoute>
                <ScheduleAppointment />
              </ProtectedRoute>
            } />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
