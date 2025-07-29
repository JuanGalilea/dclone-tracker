import z from "zod";

const Status = z.object({
  status: z.int().min(1).max(6),
  updated_at: z.int().nonnegative(),
});

enum servers {
  KR_NON_LADDER = "krNonLadder",
  KR_NON_LADDER_HARDCORE = "krNonLadderHardcore",
  KR_LADDER = "krLadder",
  KR_LADDER_HARDCORE = "krLadderHardcore",
  US_NON_LADDER = "usNonLadder",
  US_NON_LADDER_HARDCORE = "usNonLadderHardcore",
  US_LADDER = "usLadder",
  US_LADDER_HARDCORE = "usLadderHardcore",
  EU_NON_LADDER = "euNonLadder",
  EU_NON_LADDER_HARDCORE = "euNonLadderHardcore",
  EU_LADDER = "euLadder",
  EU_LADDER_HARDCORE = "euLadderHardcore",
}

const serverStatus = z.object({
  [servers.KR_NON_LADDER]: Status,
  [servers.KR_NON_LADDER_HARDCORE]: Status,
  [servers.KR_LADDER]: Status,
  [servers.KR_LADDER_HARDCORE]: Status,
  [servers.US_NON_LADDER]: Status,
  [servers.US_NON_LADDER_HARDCORE]: Status,
  [servers.US_LADDER]: Status,
  [servers.US_LADDER_HARDCORE]: Status,
  [servers.EU_NON_LADDER]: Status,
  [servers.EU_NON_LADDER_HARDCORE]: Status,
  [servers.EU_LADDER]: Status,
  [servers.EU_LADDER_HARDCORE]: Status,
  updated_at: z.int().nonnegative().default(Date.now()),
});

const API_URL = process.env.API_URL!;

let currentStatus: Partial<z.infer<typeof serverStatus>> = {};

const getDcloneStatus = async () => {
  const response = await fetch(API_URL);
  const json = await response.json();
  const parseResult = serverStatus.safeParse(json);
  if (parseResult.success) {
    currentStatus = parseResult.data;
    return;
  }
  console.error(parseResult.error, JSON.stringify(json, null, 2));
};

Bun.serve({
  port: 3000,
  async fetch() {
    if (!currentStatus.updated_at || Date.now() - currentStatus.updated_at > 1000 * 60 * 20) {
      await getDcloneStatus();
    }
    return Response.json(currentStatus);
  },
})
