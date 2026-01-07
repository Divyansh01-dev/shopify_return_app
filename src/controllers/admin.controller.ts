import { Request, Response } from "express";
import prisma from "../db/prisma";

export const getAllReturns = async (req: Request, res: Response) => {
  try {
    const returns = await (prisma as any).return.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        order: true,
        items: true,
      },
    });
    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch returns" });
  }
};

export const handleReturnAction = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body;

  try {
    const returnData = await (prisma as any).return.findUnique({ where: { id } });
    if (!returnData || !returnData.shopifyId) {
      return res.status(404).json({ error: "Return or Shopify ID not found" });
    }

    const mutation =
      action === "APPROVE"
        ? `mutation { returnApproveRequest(input: { id: "${returnData.shopifyId}" }) { return { status } userErrors { message } } }`
        : `mutation { returnDeclineRequest(input: { id: "${returnData.shopifyId}" }) { return { status } userErrors { message } } }`;

    const shopifyResponse = await fetch(
      `https://${process.env.SHOP_DOMAIN}/admin/api/2026-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN!,
        },
        body: JSON.stringify({ query: mutation }),
      }
    );

    const result: any = await shopifyResponse.json();

    if (result.errors) {
      throw new Error(`Shopify API error: ${JSON.stringify(result.errors)}`);
    }

    const finalStatus = action === "APPROVE" ? "APPROVED" : "DECLINED";
    const updatedRecord = await (prisma as any).return.update({
      where: { id },
      data: { status: finalStatus },
    });

    res.json({ message: `Return ${action} successful`, updatedRecord });
  } catch (error) {
    res.status(500).json({ error: "Action failed", details: error });
  }
};
