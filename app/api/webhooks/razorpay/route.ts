import { ConnectToDB, decrypt } from "@/lib/utils";
import { Subscription } from "@/models/subscription.model";
import { User } from "@/models/user.model";
import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

type TRazorpayEventType = "subscription.activated" | "subscription.completed" | "subscription.cancelled";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body) {
      const eventType = body.event as TRazorpayEventType;
      const payload = body?.payload;
      const subscription = payload?.subscription?.entity;
      const payment = payload?.payment?.entity;

      if(!payload || !subscription || !payment){
        throw new Error("Bad request. No payload found");
      }

      const digest = createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(JSON.stringify(body)).digest('hex');

      if(digest !== req.headers.get('x-razorpay-signature')){
        throw new Error("Bad request. Signature not matched");
      }

      const userId = decrypt(subscription.notes.userId);
      await ConnectToDB();
      const user = await User.findOne({ userId }, { _id: 1, currentSubId: 1 });
      if(!user) {
        throw new Error("User not found");
      }

      switch (eventType){
        case "subscription.activated":
          // Sometimes same event type called twice by Razorpay
          if(user.currentSubId !== subscription.id) {
            const subs = await Subscription.create({
              userId,
              subId: subscription.id,
              planId: subscription.plan_id,
              status: subscription.status,
              currentStart: subscription.current_start * 1000,
              currentEnd: subscription.current_end * 1000,
              paymentMethod: payment.method,
              currency: payment.currency,
              invoiceId: payment.invoice_id
            });

            await User.findOneAndUpdate({ userId }, {
              $set: {
                currentSubId: subscription.id,
                plan: "Professional",
                hasSubscription: true
              },
              $push: {
                subscriptionId: subs._id
              }
            });
          }
          break;
        case "subscription.cancelled":
          await Subscription.findOneAndUpdate({ subId: subscription.id }, {
            $set: {
              status: subscription.status
            }
          });
          break;
        case "subscription.completed":
          await Subscription.findOneAndUpdate({ subId: subscription.id }, {
            $set: {
              status: subscription.status
            }
          });
          break;
        default: 
          throw new Error("Invalid event type");
      }
    }
  } catch (error: any) {
    console.log("Razorpay subscription create error :", error.message);
  }

  return new NextResponse(null, { status: 200 });
}
