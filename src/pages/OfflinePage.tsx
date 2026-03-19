import { OfflineBanner } from "../components/OfflineBanner";

export function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-xl">
        <OfflineBanner
          description="Você perdeu a conexão com a internet. Alguns conteúdos continuam disponíveis se já tiverem sido carregados neste dispositivo."
          onRetry={() => window.location.reload()}
        />
      </div>
    </div>
  );
}
