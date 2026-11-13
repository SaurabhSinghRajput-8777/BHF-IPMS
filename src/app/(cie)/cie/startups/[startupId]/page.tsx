import { StartupDossierClient } from "./StartupDossierClient";

export const instant = false;

export default async function StartupDossierPage({
  params,
}: {
  params: Promise<{ startupId: string }>;
}) {
  const { startupId } = await params;
  return <StartupDossierClient startupId={startupId} />;
}
