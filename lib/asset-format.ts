import { VerificationMethod } from "./api/types";

export function verificationMethodLabel(method: VerificationMethod): string {
  return method === "dns_txt" ? "DNS TXT" : "HTTP File";
}
