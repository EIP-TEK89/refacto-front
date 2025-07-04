import { Route, Routes, Link, useLocation } from "react-router-dom";

import Footer from "./Footer";
import Home from "../pages/Home";
import LogIn from "../pages/LogIn";
import SignUp from "../pages/SignUp";
import Navigation from "../components/Navbar";
import Profile from "../pages/Profile";
import LessonJourney from "../pages/LessonJourney";
import LessonDetail from "../pages/LessonDetail";
import Dictionary from "../pages/Dictionary";
import DictionaryDetail from "../pages/DictionaryDetail";
import AiRecognition from "../pages/AiRecognition";
import AiMobileWebview from "../pages/AiMobileWebview";

function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/signup";
  const isMobileWebviewPage = location.pathname === "/ai-mobile-webview";

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    );
  }

  if (isMobileWebviewPage) {
    return (
      <Routes>
        <Route path="/ai-mobile-webview" element={<AiMobileWebview />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/lessons" element={<LessonJourney />} />
          <Route path="/lessons/:lessonId" element={<LessonDetail />} />
          <Route path="/dictionary" element={<Dictionary />} />
          <Route path="/dictionary/:signId" element={<DictionaryDetail />} />
          <Route path="/ai-recognition" element={<AiRecognition />} />
          <Route
            path="*"
            element={
              <div className="container-card">
                <h1 className="text-2xl font-bold mb-4 text-[var(--color-blue)]">
                  404 Not Found
                </h1>
                <p className="mb-6">
                  The page you're looking for doesn't exist.
                </p>
                <Link to="/" className="button-primary inline-block">
                  Go Home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
