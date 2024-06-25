import prisma from '../prismaClient.ts';

export async function createBalanceHistory(accountId: number, contractAddress: string, balance: string) {
  return prisma.balanceHistory.create({
    data: {
      accountId,
      contractAddress,
      balance,
      timestamp: new Date(),
    },
  });
}

export async function getLatestBalance(address: string) {
  return prisma.balanceHistory.findFirst({
    where: { account: { address } },
    orderBy: { timestamp: 'desc' },
    include: { account: true },
  });
}

export async function getBalanceHistory(address: string) {
  return prisma.balanceHistory.findMany({
    where: { account: { address } },
    orderBy: { timestamp: 'asc' },
    include: { account: true },
  });
}
