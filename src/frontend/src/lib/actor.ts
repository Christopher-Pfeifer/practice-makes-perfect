import { type ExternalBlob, createActor } from "@/backend";
import type { backendInterface } from "@/backend";

let _actor: backendInterface | null = null;

export function initActor(canisterId: string): void {
  const noopUpload = async (_file: ExternalBlob): Promise<Uint8Array> => {
    throw new Error("File upload not supported");
  };
  const noopDownload = async (_file: Uint8Array): Promise<ExternalBlob> => {
    throw new Error("File download not supported");
  };
  _actor = createActor(canisterId, noopUpload, noopDownload);
}

export function getActor(): backendInterface {
  if (!_actor) {
    throw new Error("Actor not initialized. Call initActor(canisterId) first.");
  }
  return _actor;
}
