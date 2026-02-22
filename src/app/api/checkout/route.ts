import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://graphopunch.pro";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: { currency: "eur", product_data: { name: "GraphoPunch Full Analysis", description: "Complete personality profile with hidden secrets and PDF" }, unit_amount: body.amount || 499 },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${baseUrl}?premium=success`,
      cancel_url: `${baseUrl}?premium=cancel`,
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
