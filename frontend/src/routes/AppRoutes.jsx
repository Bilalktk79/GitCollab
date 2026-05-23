import {
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import AuthCallback from "../pages/AuthCallback";
import MainLayout from "../layouts/MainLayout";
import Notifications from "../pages/Notifications";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import CreateRepo from "../pages/CreateRepo";
import View from "../pages/View";
import FuturePlans from "../pages/FuturePlans";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import RepositoryDetails from "../pages/RepositoryDetails";
import UploadFile from "../pages/UploadFile";
import Chat from "../pages/Chat";
import HelpRoom from "../pages/HelpRoom";
import Commits from "../pages/Commits";
import CommitDetails from "../pages/CommitDetails";
import { useAuth } from "../context/AuthContext";
import ClientAccess from "../pages/ClientAccess";
import ClientInvite from "../pages/ClientInvite";

import AdminDashboard from "../pages/AdminDashboard";
import AdminUsers from "../pages/AdminUsers";
import AdminRepos from "../pages/AdminRepos";
import AdminCommits from "../pages/AdminCommits";
import AdminClients from "../pages/AdminClients";
import AdminHelp from "../pages/AdminHelp";
import AdminLogs from "../pages/AdminLogs";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated
    ? children
    : <Navigate to="/login" replace />;
};

/* Admin only routes:
   Admin Dashboard, Users, Repos, Commits, Clients, Help, Logs */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin
    ? children
    : <Navigate to="/dashboard" replace />;
};

/* Developer + Admin routes:
   Dashboard, View, Create, Upload, Help Room, Profile, Settings */
const DeveloperRoute = ({ children }) => {
  const { isAuthenticated, isDeveloper, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isDeveloper || isAdmin
    ? children
    : <Navigate to="/commits" replace />;
};

/* Developer + Admin + Client routes:
   Commits and Chat */
const ClientDeveloperRoute = ({ children }) => {
  const {
    isAuthenticated,
    isDeveloper,
    isAdmin,
    isClient
  } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isDeveloper || isAdmin || isClient
    ? children
    : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/future-plans"
          element={<FuturePlans />}
        />

        <Route
          path="/client-access"
          element={<ClientAccess />}
        />

        <Route
          path="/auth/callback"
          element={<AuthCallback />}
        />

        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <DeveloperRoute>
              <Dashboard />
            </DeveloperRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - Admin Only */}

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/repos"
          element={
            <AdminRoute>
              <AdminRepos />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/commits"
          element={
            <AdminRoute>
              <AdminCommits />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/clients"
          element={
            <AdminRoute>
              <AdminClients />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/help"
          element={
            <AdminRoute>
              <AdminHelp />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/logs"
          element={
            <AdminRoute>
              <AdminLogs />
            </AdminRoute>
          }
        />

        {/* View All Repositories */}

        <Route
          path="/view"
          element={
            <DeveloperRoute>
              <View />
            </DeveloperRoute>
          }
        />

        <Route
          path="/manage"
          element={
            <DeveloperRoute>
              <View manageMode={true} />
            </DeveloperRoute>
          }
        />

        <Route
          path="/repositories"
          element={
            <DeveloperRoute>
              <View />
            </DeveloperRoute>
          }
        />

        <Route
          path="/starred"
          element={
            <DeveloperRoute>
              <View />
            </DeveloperRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <DeveloperRoute>
              <UploadFile />
            </DeveloperRoute>
          }
        />

        <Route
          path="/upload-file"
          element={
            <DeveloperRoute>
              <UploadFile />
            </DeveloperRoute>
          }
        />

        <Route
          path="/repositories/:owner/:repoName"
          element={
            <DeveloperRoute>
              <RepositoryDetails />
            </DeveloperRoute>
          }
        />

        <Route
          path="/create"
          element={
            <DeveloperRoute>
              <CreateRepo />
            </DeveloperRoute>
          }
        />

        {/* Commit Review Center - Developer + Admin + Client */}

        <Route
          path="/commits"
          element={
            <ClientDeveloperRoute>
              <Commits />
            </ClientDeveloperRoute>
          }
        />

        <Route
          path="/commits/:commitId"
          element={
            <ClientDeveloperRoute>
              <CommitDetails />
            </ClientDeveloperRoute>
          }
        />

        <Route
          path="/client-invite"
          element={
            <DeveloperRoute>
              <ClientInvite />
            </DeveloperRoute>
          }
        />

        {/* Chat - Developer + Admin + Client */}

        <Route
          path="/chat"
          element={
            <ClientDeveloperRoute>
              <Chat />
            </ClientDeveloperRoute>
          }
        />

        {/* Public Developer Help Room - Developer/Admin Only */}

        <Route
          path="/help-room"
          element={
            <DeveloperRoute>
              <HelpRoom />
            </DeveloperRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <DeveloperRoute>
              <Profile />
            </DeveloperRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <DeveloperRoute>
              <Settings />
            </DeveloperRoute>
          }
        />

        {/* Wrong URL fallback */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;