import { Prisma, Roles } from "../../generated/prisma/client";
import { hashPassword } from "../../utils/hashPassword";
import { connectToDatabase, disconnectFromDatabase, prisma } from "../database";
import { faker } from "@faker-js/faker";
import { env } from "../env";

const admins: Prisma.UserCreateManyInput[] = [
  {
    email: "eric.moura@gmail.com",
    confirmedEmail: true,
    firstName: "Eric",
    lastName: "Moura",
    role: Roles.ADMIN,
    username: "ericmoura1005",
    passwordHash: "1005",
  },
];

const users: Prisma.UserCreateManyInput[] = [
  {
    email: "dani.trosario@gmail.com",
    confirmedEmail: true,
    firstName: "Dani",
    lastName: "Rosario",
    role: Roles.USER,
    username: "danissauro",
    passwordHash: "1005",
  },
];

const createRandomUser = (): Prisma.UserCreateInput => {
  const sex = faker.person.sexType();

  const firstName = faker.person.firstName(sex);
  const lastName = faker.person.lastName(sex);

  return {
    firstName,
    lastName,
    username: faker.internet.username({ firstName, lastName }),
    email: faker.internet.email({ firstName, lastName }),
    passwordHash: faker.internet.password(),
    role: Roles.USER,
  };
};

const createRandomUsers = async (howMany: number) => {
  try {
    const data: Prisma.UserCreateManyInput[] = [];
    console.log("Seeding random users...");
    for (let i = 0; i < howMany; i++) {
      const user = createRandomUser();
      console.log(`creating user: ${user.email}`);
      user.passwordHash = await hashPassword(user.passwordHash);
      data.push(user);
    }
    await prisma.user.createMany({ data });
    console.log("Finish seeding random users.");
  } catch (error) {
    console.log(`Error while creating random users: ${error}`);
    process.exit(1);
  }
};

const createUsers = async (data: Prisma.UserCreateManyInput[]) => {
  try {
    for (const user of data) {
      user.passwordHash = await hashPassword(user.passwordHash);
    }
    console.log("Seeding users...");
    await prisma.user.createMany({ data });
    console.log("Finish seeding users.");
  } catch (error) {
    console.log(`Error while creating users: ${error}`);
    process.exit(1);
  }
};

const main = async () => {
  await connectToDatabase();

  await Promise.allSettled([
    createUsers(admins),
    createUsers(users),
    createRandomUsers(env.SEED_USER_COUNT),
  ]);

  await disconnectFromDatabase();
};

main();
