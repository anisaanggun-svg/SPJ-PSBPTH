import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { seedDevAdmin } from './utils/seedDevAdmin';
import { seedDataPrimer } from './utils/seedDataPrimer';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { PendingApprovalPage } from './pages/auth/PendingApprovalPage';

// Main Pages
import { DashboardPage } from './pages/DashboardPage';
import { EditProfilePage } from './pages/profile/EditProfilePage';

// Data Primer Pages
import { DataPrimerListPage } from './pages/dataPrimer/DataPrimerListPage';
import { DataPrimerFormPage } from './pages/dataPrimer/DataPrimerFormPage';

// Document Pages
import { DocumentGeneratePage } from './pages/documents/DocumentGeneratePage';
import { RekapModel3Page } from './pages/documents/RekapModel3Page';

// Admin Pages
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { MasterPejabatPage } from './pages/admin/MasterPejabatPage';

export default function App() {
  // Seed dev admin and sample data only in development mode
  if (import.meta.env.DEV) {
    seedDevAdmin();
    seedDataPrimer(1, 10);
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending" element={<PendingApprovalPage />} />

        {/* Protected Routes inside AppLayout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="profil" element={<EditProfilePage />} />
          
          <Route path="data-primer" element={<DataPrimerListPage />} />
          <Route path="data-primer/tambah" element={<DataPrimerFormPage />} />
          <Route path="data-primer/edit/:id" element={<DataPrimerFormPage />} />
          
          <Route path="dokumen/generate/:id" element={<DocumentGeneratePage />} />
          <Route path="dokumen/rekap" element={<RekapModel3Page />} />

          {/* Admin Only Routes */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute adminOnly>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/pejabat"
            element={
              <ProtectedRoute adminOnly>
                <MasterPejabatPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
