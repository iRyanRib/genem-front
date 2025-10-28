import React from "react";
import { AppProvider } from "./contexts/AppContext";
import { AppRoutes } from "./routes/AppRoutes";

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}