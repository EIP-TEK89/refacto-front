import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./store/auth";
import "./App.css";

import AppLayout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
