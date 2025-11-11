import { Request, Response, Router } from 'express';

const router = Router();

router.get('/top-protocols', (_req: Request, res: Response) => {
  const protocols = [
    {
      name: 'Jupiter',
      tvl: 3200541234,
      mcapByTvl: 0.35,
      fees_24h: 1460235,
      revenue_24h: 323441,
    },
    {
      name: 'Kamino',
      tvl: 2904267891,
      mcapByTvl: 0.06,
      fees_24h: 201988,
      revenue_24h: 31256,
    },
    {
      name: 'Jito',
      tvl: 2424177386,
      mcapByTvl: 0.12,
      fees_24h: 1020315,
      revenue_24h: 11192,
    },
    {
      name: 'Sanctum',
      tvl: 2126099844,
      mcapByTvl: 0.02,
      fees_24h: 663002,
      revenue_24h: 21286,
    },
    {
      name: 'Raydium',
      tvl: 1794102341,
      mcapByTvl: 0.23,
      fees_24h: 456701,
      revenue_24h: 67902,
    },
    {
      name: 'Binance Staked SOL',
      tvl: 1527099527,
      mcapByTvl: '',
      fees_24h: 508978,
      revenue_24h: 51124,
    },
    {
      name: 'Marinade',
      tvl: 1441123981,
      mcapByTvl: 0.03,
      fees_24h: 292687,
      revenue_24h: 19437,
    },
    {
      name: 'Drift',
      tvl: 1139112734,
      mcapByTvl: 0.12,
      fees_24h: 128925,
      revenue_24h: 31981,
    },
    {
      name: 'Meteora',
      tvl: 811228756,
      mcapByTvl: '',
      fees_24h: 2310821,
      revenue_24h: 135942,
    },
    {
      name: 'Orca',
      tvl: 387634730,
      mcapByTvl: 0.23,
      fees_24h: 391522,
      revenue_24h: 46997,
    },
  ];

  return res.json(protocols);
});

export default router;
