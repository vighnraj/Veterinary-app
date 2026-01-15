import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from './constants/routes';

// Layout
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Main Pages
import Dashboard from './pages/dashboard/Dashboard';
import ClientsList from './pages/clients/ClientsList';
import ClientDetail from './pages/clients/ClientDetail';
import ClientCreate from './pages/clients/ClientCreate';
import AnimalsList from './pages/animals/AnimalsList';
import AnimalDetail from './pages/animals/AnimalDetail';
import AnimalCreate from './pages/animals/AnimalCreate';
import BatchesList from './pages/animals/BatchesList';
import BatchDetail from './pages/animals/BatchDetail';
import AppointmentsList from './pages/appointments/AppointmentsList';
import AppointmentDetail from './pages/appointments/AppointmentDetail';
import AppointmentCreate from './pages/appointments/AppointmentCreate';
import ServicesList from './pages/appointments/ServicesList';
import ReproductiveOverview from './pages/reproductive/ReproductiveOverview';
import PregnantAnimals from './pages/reproductive/PregnantAnimals';
import SanitaryOverview from './pages/sanitary/SanitaryOverview';
import VaccinationAlerts from './pages/sanitary/VaccinationAlerts';
import Campaigns from './pages/sanitary/Campaigns';
import FinancialOverview from './pages/financial/FinancialOverview';
import InvoicesList from './pages/financial/InvoicesList';
import InvoiceDetail from './pages/financial/InvoiceDetail';
import InvoiceCreate from './pages/financial/InvoiceCreate';
import Receivables from './pages/financial/Receivables';
import Reports from './pages/reports/Reports';
import SubscriptionStatus from './pages/subscription/SubscriptionStatus';
import Plans from './pages/subscription/Plans';
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/settings/Profile';
import Users from './pages/settings/Users';
import NotFound from './pages/NotFound';

const router = createBrowserRouter([
  // Auth routes (public)
  {
    path: ROUTES.LOGIN,
    element: <Login />,
  },
  {
    path: ROUTES.REGISTER,
    element: <Register />,
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    element: <ForgotPassword />,
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPassword />,
  },
  {
    path: ROUTES.VERIFY_EMAIL,
    element: <VerifyEmail />,
  },

  // Protected routes
  {
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      {
        path: ROUTES.DASHBOARD,
        element: <Dashboard />,
      },

      // Clients
      {
        path: ROUTES.CLIENTS,
        element: <ClientsList />,
      },
      {
        path: ROUTES.CLIENT_CREATE,
        element: <ClientCreate />,
      },
      {
        path: ROUTES.CLIENT_DETAIL,
        element: <ClientDetail />,
      },
      {
        path: ROUTES.CLIENT_EDIT,
        element: <ClientCreate />,
      },

      // Animals
      {
        path: ROUTES.ANIMALS,
        element: <AnimalsList />,
      },
      {
        path: ROUTES.ANIMAL_CREATE,
        element: <AnimalCreate />,
      },
      {
        path: ROUTES.ANIMAL_DETAIL,
        element: <AnimalDetail />,
      },
      {
        path: ROUTES.ANIMAL_EDIT,
        element: <AnimalCreate />,
      },
      {
        path: ROUTES.BATCHES,
        element: <BatchesList />,
      },
      {
        path: ROUTES.BATCH_CREATE,
        element: <BatchesList />,
      },
      {
        path: ROUTES.BATCH_DETAIL,
        element: <BatchDetail />,
      },

      // Appointments
      {
        path: ROUTES.APPOINTMENTS,
        element: <AppointmentsList />,
      },
      {
        path: ROUTES.APPOINTMENT_CREATE,
        element: <AppointmentCreate />,
      },
      {
        path: ROUTES.APPOINTMENT_DETAIL,
        element: <AppointmentDetail />,
      },
      {
        path: ROUTES.SERVICES,
        element: <ServicesList />,
      },

      // Reproductive
      {
        path: ROUTES.REPRODUCTIVE,
        element: <ReproductiveOverview />,
      },
      {
        path: ROUTES.PREGNANT_ANIMALS,
        element: <PregnantAnimals />,
      },

      // Sanitary
      {
        path: ROUTES.SANITARY,
        element: <SanitaryOverview />,
      },
      {
        path: ROUTES.VACCINATION_ALERTS,
        element: <VaccinationAlerts />,
      },
      {
        path: ROUTES.CAMPAIGNS,
        element: <Campaigns />,
      },

      // Financial
      {
        path: ROUTES.FINANCIAL,
        element: <FinancialOverview />,
      },
      {
        path: ROUTES.INVOICES,
        element: <InvoicesList />,
      },
      {
        path: ROUTES.INVOICE_CREATE,
        element: <InvoiceCreate />,
      },
      {
        path: ROUTES.INVOICE_DETAIL,
        element: <InvoiceDetail />,
      },
      {
        path: ROUTES.RECEIVABLES,
        element: <Receivables />,
      },

      // Reports
      {
        path: ROUTES.REPORTS,
        element: <Reports />,
      },

      // Subscription
      {
        path: ROUTES.SUBSCRIPTION,
        element: <SubscriptionStatus />,
      },
      {
        path: ROUTES.PLANS,
        element: <Plans />,
      },

      // Notifications
      {
        path: ROUTES.NOTIFICATIONS,
        element: <Notifications />,
      },

      // Settings
      {
        path: ROUTES.PROFILE,
        element: <Profile />,
      },
      {
        path: ROUTES.USERS,
        element: <Users />,
      },
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
