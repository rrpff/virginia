export type Config = {
  host: string;
  port: number;
  migrateOnStart: boolean;
  refreshOnStart: boolean;
  serveFrontend: boolean;
  publicRoot?: string;
};
