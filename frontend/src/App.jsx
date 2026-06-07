import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Landing from "./pages/Landing.jsx";
import Home from "./pages/Home.jsx";
import ArticlePage from "./pages/Article.jsx";
import Login from "./pages/Login.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Create from "./pages/Create.jsx";
import Manage from "./pages/Manage.jsx";
import Edit from "./pages/Edit.jsx";
import Settings from "./pages/Settings.jsx";
import NotFound from "./pages/NotFound.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import Disclaimer from "./pages/Disclaimer.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/article/:id" element={<ArticlePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="create" element={<Create />} />
          <Route path="manage" element={<Manage />} />
          <Route path="edit/:id" element={<Edit />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
