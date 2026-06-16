import { BrowserRouter, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
