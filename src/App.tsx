import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { PortalLayout } from "./layout/PortalLayout";

// Eager-loaded (critical path)
import { HomePage } from "./pages/HomePage";
import { SobrePage } from "./pages/SobrePage";
import { DadosPage } from "./pages/DadosPage";

// Lazy-loaded (non-critical)
const AgendaPage = lazy(() => import("./pages/AgendaPage").then(m => ({ default: m.AgendaPage })));
const InscricoesPage = lazy(() => import("./pages/InscricoesPage").then(m => ({ default: m.InscricoesPage })));
const TransparenciaPage = lazy(() => import("./pages/TransparenciaPage").then(m => ({ default: m.TransparenciaPage })));
const AlertasPage = lazy(() => import("./pages/AlertasPage").then(m => ({ default: m.AlertasPage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then(m => ({ default: m.SearchPage })));
const StatusPage = lazy(() => import("./pages/StatusPage").then(m => ({ default: m.StatusPage })));

// Acervo lazy-loaded
const AcervoPage = lazy(() => import("./pages/acervo/AcervoPage").then(m => ({ default: m.AcervoPage })));
const AcervoTimelinePage = lazy(() => import("./pages/acervo/AcervoTimelinePage").then(m => ({ default: m.AcervoTimelinePage })));
const AcervoListPage = lazy(() => import("./pages/acervo/AcervoListPage").then(m => ({ default: m.AcervoListPage })));
const AcervoItemPage = lazy(() => import("./pages/acervo/AcervoItemPage").then(m => ({ default: m.AcervoItemPage })));
const CollectionsListPage = lazy(() => import("./pages/acervo/CollectionsListPage").then(m => ({ default: m.CollectionsListPage })));
const CollectionDetailPage = lazy(() => import("./pages/acervo/CollectionDetailPage").then(m => ({ default: m.CollectionDetailPage })));

// Blog lazy-loaded
const BlogListPage = lazy(() => import("./pages/BlogListPage").then(m => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage").then(m => ({ default: m.BlogPostPage })));

// Conversar lazy-loaded
const ConversarListPage = lazy(() => import("./pages/conversar/ConversarListPage").then(m => ({ default: m.ConversarListPage })));
const ConversarDetailPage = lazy(() => import("./pages/conversar/ConversarDetailPage").then(m => ({ default: m.ConversarDetailPage })));

// Corredores lazy-loaded
const CorredoresListPage = lazy(() => import("./pages/corredores/CorredoresListPage").then(m => ({ default: m.CorredoresListPage })));
const CorredoresDetailPage = lazy(() => import("./pages/corredores/CorredoresDetailPage").then(m => ({ default: m.CorredoresDetailPage })));

// Mapa lazy-loaded
const MapaPage = lazy(() => import("./pages/MapaPage").then(m => ({ default: m.MapaPage })));

// Fallback loading component
function LoadingFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-brand-primary border-t-transparent" />
        <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Carregando conteúdo...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PortalLayout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/alertas" element={<AlertasPage />} />
          <Route path="/dados" element={<DadosPage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/conversar" element={<ConversarListPage />} />
          <Route path="/conversar/:slug" element={<ConversarDetailPage />} />
          <Route path="/corredores" element={<CorredoresListPage />} />
          <Route path="/corredores/:slug" element={<CorredoresDetailPage />} />
          <Route path="/mapa" element={<MapaPage />} />
          <Route path="/inscricoes" element={<InscricoesPage />} />
          <Route path="/sobre" element={<SobrePage />} />
          <Route path="/transparencia" element={<TransparenciaPage />} />
          <Route path="/acervo" element={<AcervoPage />} />
          <Route path="/acervo/linha" element={<AcervoTimelinePage />} />
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
      </Suspense>
    </PortalLayout>
  );
}
