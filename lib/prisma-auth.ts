// This re-exports the shared prisma client.
// All auth operations use the same singleton to avoid duplicate connections.
export { prisma as prismaAuth } from "@/lib/prisma"
