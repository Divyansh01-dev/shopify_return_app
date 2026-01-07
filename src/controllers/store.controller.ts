import { Request, Response } from "express";
import prisma from "../db/prisma";

export const registerStore = async (req: Request, res: Response) => {
  try {
    const { shop, accessToken } = req.body;

    if (!shop || !accessToken) {
      return res.status(400).json({ message: "Missing shop or accessToken" });
    }

    const store = await (prisma as any).store.upsert({
      where: { shop },
      update: { accessToken },
      create: { shop, accessToken },
    });

    res.status(200).json(store);
  } catch (error) {
    res.status(500).json({ message: "Failed to register store" });
  }
};
export const getAllReturnsByStore = async (req: Request, res: Response) => {
  try {
    const { shop } = req.params;

    const store = await (prisma as any).store.findUnique({ where: { shop } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const returns = await (prisma as any).returnRequest.findMany({
      where: { storeId: store.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      shop: store.shop,
      total: returns.length,
      returns,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch returns" });
  }
};
