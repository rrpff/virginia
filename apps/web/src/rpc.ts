import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { RPC } from "@virginia/server"; // IMPORTANT THIS REMAINS "import type"

const host = `http://${window.location.hostname}:26541`;
export const rpc = createTRPCProxyClient<RPC>({
  links: [
    httpBatchLink({
      url: `${host}/rpc`,
    }),
  ],
});
