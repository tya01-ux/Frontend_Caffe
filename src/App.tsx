import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

// Import Pages (Public)
import Home from "./pages/Home";
import CafeList from "./pages/CafeList";
import CafeDetail from "./pages/CafeDetail";
// import Recommendation from "./pages/Recommendation";
import Rengking from "./pages/Rengking";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Import Pages (Admin)
import DashboardIndex from "./pages/admin/DashboardIndex";
import KriteriaIndex from "./pages/admin/kriteria/KriteriaIndex";
import CafesIndex from "./pages/admin/cafes/CafesIndex";
import PenilaianIndex from "./pages/admin/penilaian/PenilaianIndex";
import PerhitunganIndex from "./pages/admin/perhitungan/PerhitunganIndex";
import RengkinIndex from "./pages/admin/ranking/RengkinIndex";
import UserIndex from "./pages/admin/users/UserIndex";
import TenantIndex from "./pages/admin/tenant/TenantIndex";
import NilaiAlternatifIndex from "./pages/admin/nilaiAlternatif/NilaiAlternatifIndex";
// import RiwayatRekomendasi from "./pages/admin/riwayat/RiwayatIndex";
import ProfilIndex from "./pages/admin/profile/ProfilIndex";

// Import Protected Route Guard
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* User */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cafes" element={<CafeList />} />
          <Route path="/cafes/:id" element={<CafeDetail />} />
          <Route path="/ranking" element={<Rengking />} />
          <Route path="/about" element={<About />} />
          <Route path="/profile" element={<Profile />} />          
        </Route>

        {/* Admin*/}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardIndex />} />
            <Route path="kriteria" element={<KriteriaIndex />} />
            <Route path="cafes" element={<CafesIndex />} />
            <Route path="penilaian" element={<PenilaianIndex />} />
            <Route path="perhitungan" element={<PerhitunganIndex />} />
            <Route path="ranking" element={<RengkinIndex />} />
            <Route path="users" element={<UserIndex />} />
            <Route path="tenant" element={<TenantIndex />} />
            <Route path="nilaiAlternatif" element={<NilaiAlternatifIndex />} />
            <Route path="profile" element={<ProfilIndex />} />
          </Route>
        </Route>

        {/* Fallback rute acak: lempar ke halaman beranda publik */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;