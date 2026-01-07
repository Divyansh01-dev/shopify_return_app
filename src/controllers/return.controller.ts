import { Request, Response } from "express";
import prisma from "../db/prisma";

export const syncOrder = async (req: Request, res: Response) => {
  try {
    const {
      id,
      orderNumber,
      customerEmail,
      totalPrice,
      currencyCode,
      line_items,
    } = req.body;
    console.log("====================================");
    console.log("req.body", req.body);
    console.log("====================================");
    const order = await (prisma as any).order.upsert({
      where: { id: id },
      update: {
        customerEmail,
        totalPrice,
      },
      create: {
        id,
        orderNumber,
        customerEmail,
        totalPrice,
        currencyCode,
        lineItems: {
          create: line_items.map((item: any) => ({
            id: item.admin_graphql_api_id,
            productId: `gid://shopify/Product/${item.product_id}`,
            variantId: `gid://shopify/ProductVariant/${item.variant_id}`,
            title: item.title,
            variantTitle: item.variant_title,
            quantity: item.quantity,
            price: item.price,
            sku: item.sku,
          })),
        },
      },
    });

    res.status(200).json({ message: "Order and items synced", order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Sync failed" });
  }
};

export const createReturn = async (req: Request, res: Response) => {
  try {
    const { orderId, reason, items } = req.body;

    const newReturn = await (prisma as any).return.create({
      data: {
        orderId: orderId,
        reason: reason,
        status: "REQUESTED",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            name: item.name,
            sku: item.sku,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(newReturn);
  } catch (error) {
    res.status(500).json({ error: "Could not create return request" });
  }
};

export const getReturnDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const returnRequest = await (prisma as any).return.findUnique({
      where: { id },
      include: {
        items: true,
        order: true,
      },
    });

    if (!returnRequest) {
      return res.status(404).json({ error: "Return request not found" });
    }

    res.json(returnRequest);
  } catch (error) {
    res.status(500).json({ error: "Error fetching return details" });
  }
};

export const updateReturnStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedReturn = await (prisma as any).return.update({
      where: { id },
      data: { status },
    });

    res.json(updatedReturn);
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};
