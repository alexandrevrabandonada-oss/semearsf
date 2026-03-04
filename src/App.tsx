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
import { AlertasPage } from "./pages/AlertasPage";
import { BlogListPage } from "./pages/BlogListPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { StatusPage } from "./pages/StatusPage";
import { SearchPage } from "./pages/SearchPage";
import { CollectionsListPage } from "./pages/acervo/CollectionsListPage";
import { CollectionDetailPage } from "./pages/acervo/CollectionDetailPage";

export default function App() {
  return (
    <PortalLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/alertas" element={<AlertasPage />} />
        <Route path="/dados" element={<DadosPage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/inscricoes" element={<InscricoesPage />} />
        <Route path="/sobre" element={<SobrePage />} />
        <Route path="/transparencia" element={<TransparenciaPage />} />
        <Route path="/acervo" element={<AcervoPage />} />
        <Route path="/acervo/:area" element={<AcervoListPage />} />
        <Route path="/acervo/item/:slug" element={<AcervoItemPage />} />
        <Route path="/dossies" element={<CollectionsListPage />} />
        <Route path="/dossies/:slug" element={<CollectionDetailPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PortalLayout>
  );
}
