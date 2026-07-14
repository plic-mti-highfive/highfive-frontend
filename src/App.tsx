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

        <Route path="/create-project" element={<CreateProjectPage />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
        <Route path="/projects/:id/news" element={<ProjectNewsPage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />

        <Route path="/projects/:projectId/canvas" element={<CanvasPage />} />
        <Route path="/projects/:projectId/lab" element={<LabPage />} />
        <Route
          path="/projects/:projectId/moodboard"
          element={<MoodboardPage />}
        />

        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />

        <Route path="/debug" element={<Debug />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
