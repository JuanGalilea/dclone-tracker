import z from "zod";

const Status = z.object({
  status: z.int().min(0).max(5),
  updated_at: z.int().nonnegative(),
});

enum ServerCode {
  KR= "kr",
  US= "us",
  EU= "eu",
}

enum RankedType {
  NON_LADDER = "nonLadder",
  LADDER = "ladder",
}
enum Core {
  HARDCORE = "hardcore",
  SOFTCORE = "softcore",
}

type DCloneCategorizedResponse = {
  [Core.HARDCORE]: {
    [RankedType.NON_LADDER]: {
      [ServerCode.KR]: z.infer<typeof Status>,
      [ServerCode.US]: z.infer<typeof Status>,
      [ServerCode.EU]: z.infer<typeof Status>,
    },
    [RankedType.LADDER]: {
      [ServerCode.KR]: z.infer<typeof Status>,
      [ServerCode.US]: z.infer<typeof Status>,
      [ServerCode.EU]: z.infer<typeof Status>,
    },
  },
  [Core.SOFTCORE]: {
    [RankedType.NON_LADDER]: {
      [ServerCode.KR]: z.infer<typeof Status>,
      [ServerCode.US]: z.infer<typeof Status>,
      [ServerCode.EU]: z.infer<typeof Status>,
    },
    [RankedType.LADDER]: {
      [ServerCode.KR]: z.infer<typeof Status>,
      [ServerCode.US]: z.infer<typeof Status>,
      [ServerCode.EU]: z.infer<typeof Status>,
    },
  }
}

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

type StatusItem = z.infer<typeof Status> & {
  server: ServerCode,
  core: Core,
  rankedType: RankedType,
};

const API_URL = process.env.API_URL!;

let currentStatus: Partial<z.infer<typeof serverStatus>> = {};
let currentStatusCategorized: DCloneCategorizedResponse | undefined;
let statusArray: StatusItem[] = [];

const transformToCategorizedStatus = (status: z.infer<typeof serverStatus>): DCloneCategorizedResponse => {
  const categorizedStatus: DCloneCategorizedResponse = {
    [Core.HARDCORE]: {
      [RankedType.NON_LADDER]: {
        [ServerCode.KR]: status[servers.KR_NON_LADDER],
        [ServerCode.US]: status[servers.US_NON_LADDER],
        [ServerCode.EU]: status[servers.EU_NON_LADDER],
      },
      [RankedType.LADDER]: {
        [ServerCode.KR]: status[servers.KR_LADDER],
        [ServerCode.US]: status[servers.US_LADDER],
        [ServerCode.EU]: status[servers.EU_LADDER],
      },
    },
    [Core.SOFTCORE]: {
      [RankedType.NON_LADDER]: {
        [ServerCode.KR]: status[servers.KR_NON_LADDER_HARDCORE],
        [ServerCode.US]: status[servers.US_NON_LADDER_HARDCORE],
        [ServerCode.EU]: status[servers.EU_NON_LADDER_HARDCORE],
      },
      [RankedType.LADDER]: {
        [ServerCode.KR]: status[servers.KR_LADDER_HARDCORE],
        [ServerCode.US]: status[servers.US_LADDER_HARDCORE],
        [ServerCode.EU]: status[servers.EU_LADDER_HARDCORE],
      },
    },
  };
  return categorizedStatus;
};

const getDcloneStatus = async () => {
  const response = await fetch(API_URL);
  const json = await response.json();
  const parseResult = serverStatus.safeParse(json);
  if (!parseResult.success) {
  console.error(parseResult.error, JSON.stringify(json, null, 2));
    return;
  }
  currentStatus = parseResult.data;
  currentStatusCategorized = transformToCategorizedStatus(parseResult.data);
};

Bun.serve({
  port: 3000,
  async fetch(req) {
    if (!currentStatus.updated_at || Date.now() - currentStatus.updated_at > 1000 * 60 * 20) {
      await getDcloneStatus();
    }
    if (req.url.endsWith("/categorized")) {
      return Response.json(currentStatusCategorized);
    }
    return Response.json(currentStatus);
  },
})
