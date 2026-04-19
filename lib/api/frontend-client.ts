import createClient from "openapi-fetch";
import type { paths } from "@/types/api.generated";

export const frontendClient = createClient<paths>({
  baseUrl: "/api/backend",
});
