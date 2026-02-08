import "./i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { SiteProvider } from "./context/SiteContext";
import { SidebarProvider } from "./context/SidebarContext";
import { BreadcrumbActionsProvider } from './context/BreadcrumbActionsContext';
import { FooterProvider } from './context/FooterContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BreadcrumbActionsProvider>
      <SidebarProvider>
        <SiteProvider>
          <FooterProvider>
            <ToastContainer position="top-right" theme="colored" />
            <App />
          </FooterProvider>
        </SiteProvider>
      </SidebarProvider>
      <style>
        {`
        .Toastify__toast {
          font-weight: bold;
        }
        `}
      </style>
    </BreadcrumbActionsProvider>
  </StrictMode>
);