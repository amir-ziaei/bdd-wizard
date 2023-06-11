import { ensureSecure, removeTrailingSlashes } from "./utils/http-utils";

export async function handleVitalRedirects(request: Request): Promise<void> {
  await ensureSecure(request);
  await removeTrailingSlashes(request);
}
