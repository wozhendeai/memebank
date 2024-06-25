import prisma from '../prismaClient';

export async function createAccount(address: string, creator: string) {
  return prisma.account.create({
    data: { address, creator },
  });
}

export async function getAccounts() {
  return prisma.account.findMany();
}

export async function getAccount(address: string) {
  return prisma.account.findUnique({ where: { address } });
}

export async function updateUsername(address: string, username: string) {
  return prisma.account.update({
    where: { address },
    data: { username },
  });
}
