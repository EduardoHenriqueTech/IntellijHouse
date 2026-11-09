import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HouseProvider } from "./context/HouseContext";
import { ToastProvider } from "./context/ToastContext";
import { ActivityPage } from "./pages/ActivityPage";
import { AssistantPage } from "./pages/AssistantPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { RoomsPage } from "./pages/RoomsPage";
import { RoutinePage } from "./pages/RoutinePage";
import { AdminPage } from "./pages/admin/AdminPage";

/** Layout do morador: o HouseProvider só existe aqui, então a área admin não faz polling de dispositivos/rotinas. */
function AreaDoMorador() {
  return (
    <HouseProvider>
      <Layout />
    </HouseProvider>
  );
}

export default function App() {
  // HashRouter: as URLs ficam em /#/rota, sem conflito com as rotas da API (/dispositivos, /rotina...)
  return (
    <HashRouter>
      <ToastProvider>
        <Routes>
          <Route element={<AreaDoMorador />}>
            <Route index element={<DashboardPage />} />
            <Route path="dispositivos" element={<DevicesPage />} />
            <Route path="assistente" element={<AssistantPage />} />
            <Route path="ambientes/:ambiente?" element={<RoomsPage />} />
            <Route path="atividade" element={<ActivityPage />} />
            <Route path="rotinas" element={<RoutinePage />} />
          </Route>
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </HashRouter>
  );
}
