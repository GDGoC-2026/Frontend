import createClient from "openapi-fetch";
import type { paths } from "@/types/api.generated";
import { BACKEND_API_URL } from "@/lib/config";

export const backendClient = createClient<paths>({
  baseUrl: BACKEND_API_URL,
});
