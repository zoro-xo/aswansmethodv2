import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import TermsPage from "./terms/page.jsx";
import PolicyPage from "./policy/page.jsx";
import StepsPage from "./steps/page.jsx";
import PrivacySelfieData from "./privacy/page.jsx";
import "./index.css";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/policy", element: <PolicyPage /> },
  { path: "/privacy", element: <PrivacySelfieData /> },
  { path: "/steps", element: <StepsPage /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
