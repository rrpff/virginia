import { createTRPCReact } from "@trpc/react-query";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { RPC } from "@virginia/server/client"; // IMPORTANT THIS REMAINS "import type"

export type RpcInputs = inferRouterInputs<RPC>;
export type RpcOutputs = inferRouterOutputs<RPC>;

export const rpc = createTRPCReact<RPC>();
