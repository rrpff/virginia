import { createTRPCReact } from "@trpc/react-query";
import type { RPC } from "@virginia/server"; // IMPORTANT THIS REMAINS "import type"

export const rpc = createTRPCReact<RPC>();
