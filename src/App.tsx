import { Navigate, Route, Routes } from "react-router-dom";

import { PortalLayout } from "./layout/PortalLayout";
import { AgendaPage } from "./pages/AgendaPage";
import { DadosPage } from "./pages/DadosPage";
import { HomePage } from "./pages/HomePage";
import { InscricoesPage } from "./pages/InscricoesPage";
import { SobrePage } from "./pages/SobrePage";
import { TransparenciaPage } from "./pages/TransparenciaPage";

export default function App() {
  return (
    <PortalLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dados" element={<DadosPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/inscricoes" element={<InscricoesPage />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/transparencia" element={<TransparenciaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PortalLayout>
  );
}
