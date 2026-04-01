import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App            from "./App.jsx";
import PublicCVPage   from "./pages/PublicCVPage.jsx";
import ApplyPage      from "./pages/ApplyPage.jsx";
import JobsPortalPage from "./pages/JobsPortalPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/cv/:id"           element={<PublicCVPage />} />
        <Route path="/apply/:recruiterId" element={<ApplyPage />} />
        <Route path="/jobs/:slug"       element={<JobsPortalPage />} />
        <Route path="/*"                element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);