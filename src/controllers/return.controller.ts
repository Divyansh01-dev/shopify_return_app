import { Request, Response } from "express";
import prisma from "../db/prisma";
import { shopifyRequest } from "../utils/shopifyClient";

export const verifyOrder = async (req: Request, res: Response) => {
  try {
    const { shop, orderName, email } = req.body;

    const store = await (prisma as any).store.findUnique({ where: { shop } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const shopify = shopifyRequest(store.shop, store.accessToken);

    const { data } = await shopify.get("/orders.json", {
      params: { name: orderName, status: "any" },
    });

    const order = data.orders?.[0];

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.email?.toLowerCase() !== email.toLowerCase()) {
      return res.status(400).json({ message: "Email does not match" });
    }

    if (order.financial_status !== "paid") {
      return res.status(400).json({ message: "Order is not paid" });
    }

    if (order.fulfillment_status !== "fulfilled") {
      return res.status(400).json({ message: "Order is not fulfilled" });
    }

    res.status(200).json({
      verified: true,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Order verification failed" });
  }
};

export const createReturnRequest = async (req: Request, res: Response) => {
  try {
    const { shop, orderId, orderName, email, items } = req.body;

    const store = await (prisma as any).store.findUnique({ where: { shop } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const existing = await (prisma as any).returnRequest.findUnique({
      where: {
        orderId_storeId: {
          orderId,
          storeId: store.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        message: "Return request already exists for this order",
      });
    }

    const returnRequest = await (prisma as any).returnRequest.create({
      data: {
        orderId,
        orderName,
        email,
        storeId: store.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId ?? null,
            title: item.title,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    res.status(201).json(returnRequest);
  } catch {
    res.status(500).json({ message: "Failed to create return request" });
  }
};

export const getReturnByOrderId = async (req: Request, res: Response) => {
  try {
    const { shop, orderId } = req.params;

    const store = await (prisma as any).store.findUnique({ where: { shop } });
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const returnRequest = await (prisma as any).returnRequest.findUnique({
      where: {
        orderId_storeId: {
          orderId,
          storeId: store.id,
        },
      },
      include: { items: true },
    });

    if (!returnRequest) {
      return res.status(404).json({ message: "Return not found" });
    }

    res.json(returnRequest);
  } catch {
    res.status(500).json({ message: "Failed to fetch return" });
  }
};

export const updateReturnStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await (prisma as any).returnRequest.update({
      where: { id },
      data: { status },
      include: { items: true },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: "Failed to update status" });
  }
};
