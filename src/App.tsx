import { Routes, Route } from "react-router-dom";

import { HomePage } from "@features/home";
import { LoginPage, RegisterPage } from "@features/auth";
import {
  CreateProjectPage,
  ProjectDetailPage,
  ProjectNewsPage,
} from "@features/projects";
import { UserProfilePage } from "@features/user";
import { SearchPage } from "@features/search";
import { MessagesPage } from "@features/messages";
import { NotificationsPage } from "@features/notifications";
import { AdminDashboardPage } from "@features/admin";

import { LabPage, MoodboardPage } from "@features/lab";

import Debug from "./pages/Debug";
import NotFoundPage from "./pages/NotFoundPage";

import { ScrollToTop } from "@shared/components/ScrollToTop";
import { ScrollToTopButton } from "@shared/components/ScrollToTopButton";
import { AdminRoute, ProtectedRoute } from "@shared/components/ProtectedRoute";
import CanvasPage from "@features/canvas/pages/CanvasPage";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <ScrollToTopButton />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/search" element={<SearchPage />} />
        <Route path="/search/projects" element={<SearchPage />} />
        <Route path="/search/users" element={<SearchPage />} />
        <Route path="/search/tags" element={<SearchPage />} />

        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <CreateProjectPage />
            </ProtectedRoute>
          }
        />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/news" element={<ProjectNewsPage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />

        {/* Espaces de travail : reserves aux membres du projet, que le backend
            verifie de son cote (403 sur le canvas notamment). */}
        <Route
          path="/projects/:projectId/canvas"
          element={
            <ProtectedRoute>
              <CanvasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/lab"
          element={
            <ProtectedRoute>
              <LabPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:projectId/moodboard"
          element={
            <ProtectedRoute>
              <MoodboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />

        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
