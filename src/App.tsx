import { Navigate, Route, Routes } from "react-router-dom";

import { PortalLayout } from "./layout/PortalLayout";
import { AgendaPage } from "./pages/AgendaPage";
import { DadosPage } from "./pages/DadosPage";
import { HomePage } from "./pages/HomePage";
import { InscricoesPage } from "./pages/InscricoesPage";
import { SobrePage } from "./pages/SobrePage";
import { TransparenciaPage } from "./pages/TransparenciaPage";
import { AcervoPage } from "./pages/acervo/AcervoPage";
import { AcervoListPage } from "./pages/acervo/AcervoListPage";
import { AcervoItemPage } from "./pages/acervo/AcervoItemPage";

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
        <Route path="/acervo" element={<AcervoPage />} />
        <Route path="/acervo/:area" element={<AcervoListPage />} />
        <Route path="/acervo/item/:slug" element={<AcervoItemPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PortalLayout>
  );
}
