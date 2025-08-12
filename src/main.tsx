import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; // 1. Import Router
import App from "./App.tsx";
import { AuthProvider } from "./components/AuthProvider"; // 2. Import AuthProvider
import { SocketProvider } from "./context/SocketContext.tsx";
import { Toaster } from "react-hot-toast";
import { RequestProvider } from "./context/RequestContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* All providers should be at the top level */}
    <Router>
      <AuthProvider>
        {" "}
        
        <SocketProvider>
          <RequestProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <App />
          </RequestProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  </StrictMode>
);
