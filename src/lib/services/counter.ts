import { prisma } from "@/lib/prisma";

export async function nextSequence(name: string): Promise<number> {
  const result = await prisma.counter.upsert({
    where: { id: name },
    create: { id: name, value: 1 },
    update: { value: { increment: 1 } },
  });
  return result.value;
}

export async function nextBookingCode(): Promise<string> {
  const n = await nextSequence("booking");
  return `KGR-${String(n).padStart(4, "0")}`;
}

export async function nextIncidentCode(): Promise<string> {
  const n = await nextSequence("incident");
  return `INC-${String(n).padStart(3, "0")}`;
}
