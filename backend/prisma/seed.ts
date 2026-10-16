import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Every seeded account uses this password
const PASSWORD = "Password@123";

async function main() {
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const createUser = (name: string, email: string, address: string, role: Role) =>
    prisma.user.create({ data: { name, email, address, role, passwordHash } });

  await createUser(
    "System Super Administrator",
    "admin@storerating.com",
    "100 Enterprise Boulevard, Suite 500, Innovation District, CA",
    "ADMIN"
  );

  const robert = await createUser(
    "Robert Johnson Store Manager",
    "owner.robert@storerating.com",
    "420 Market Street, Central Plaza, Austin, TX",
    "STORE_OWNER"
  );
  const eleanor = await createUser(
    "Eleanor Vance Store Curator",
    "owner.eleanor@storerating.com",
    "789 Evergreen Terrace, Organic District, Portland, OR",
    "STORE_OWNER"
  );

  const chris = await createUser(
    "Christopher Nolan Reviewer",
    "user.chris@storerating.com",
    "12 Sunset Boulevard, West End, Los Angeles, CA",
    "USER"
  );
  const sam = await createUser(
    "Samantha Carter Reviewer",
    "user.sam@storerating.com",
    "550 Broadway Avenue, Downtown, New York, NY",
    "USER"
  );
  const alex = await createUser(
    "Alexander Hamilton Citizen",
    "user.alex@storerating.com",
    "88 Constitution Way, Historical District, Boston, MA",
    "USER"
  );

  const coffee = await prisma.store.create({
    data: {
      name: "Apex Artisan Coffee Roasters",
      email: "contact@apexcoffee.com",
      address: "420 Market Street, Central Plaza, Austin, TX",
      ownerId: robert.id,
    },
  });
  const market = await prisma.store.create({
    data: {
      name: "Starlight Organic Supermarket",
      email: "info@starlightmarket.com",
      address: "789 Evergreen Terrace, Organic District, Portland, OR",
      ownerId: eleanor.id,
    },
  });
  // left without an owner on purpose
  const books = await prisma.store.create({
    data: {
      name: "Metro Haven Books & Media",
      email: "support@metrohavenbooks.com",
      address: "101 Literary Boulevard, Midtown, Chicago, IL",
    },
  });

  await prisma.rating.createMany({
    data: [
      { userId: chris.id, storeId: coffee.id, score: 5 },
      { userId: sam.id, storeId: coffee.id, score: 4 },
      { userId: alex.id, storeId: coffee.id, score: 5 },
      { userId: chris.id, storeId: market.id, score: 4 },
      { userId: sam.id, storeId: market.id, score: 3 },
      { userId: alex.id, storeId: books.id, score: 5 },
    ],
  });

  console.log(`Seed done. All accounts use password: ${PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
