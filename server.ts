import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(morgan("tiny"));

const prisma = new PrismaClient();

app.post("/bills/add", async (req, res) => {
  const { balance, dayDue, interestRate, limit, payment, title, userId } =
    req.body;
  const bill = await prisma.bill.create({
    data: {
      balance,
      dayDue,
      interestRate,
      limit,
      payment,
      title,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
  res.json(bill);
});

app.post("/signup", async (req, res) => {
  const { password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });
  res.json({
    message: `trying to send email: ${email} and password: ${password} and got a successful ${user.email}`,
  });
});

app.get("/bills/:id", async (req, res) => {
  const userId = req.params.id;
  const bills = await prisma.bill.findMany({
    where: { userId },
    // orderBy: { title: "desc" },
  });
  res.json(bills);
});

app.get("/users", async (req, res) => {
  // const userId = req.params.id;
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
