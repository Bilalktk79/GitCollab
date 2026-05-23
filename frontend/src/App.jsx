import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { RepoProvider } from "./context/RepoContext";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <AuthProvider>
      <RepoProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" />
        </BrowserRouter>
      </RepoProvider>
    </AuthProvider>
  );
}

export default App;