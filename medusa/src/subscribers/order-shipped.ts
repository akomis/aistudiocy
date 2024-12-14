import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/types";
import { Modules } from "@medusajs/utils";
import { EmailTemplates } from "../modules/email-notifications/templates";

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION);
  const orderModuleService: IOrderModuleService = container.resolve(
    Modules.ORDER
  );
  const order = await orderModuleService.retrieveOrder(data.order_id, {
    relations: ["items", "summary", "shipping_address", "shipping_methods"],
  });
  const shippingAddress = await (
    orderModuleService as any
  ).orderAddressService_.retrieve(order.shipping_address.id);

  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: EmailTemplates.ORDER,
      data: {
        emailOptions: {
          replyTo: process.env.ADMIN_EMAIL,
          subject: "Your order has been shipped",
        },
        order,
        shippingAddress,
        preview: "Order Shipped",
        message:
          "Your order has been shipped and is on its way to you. If the package doesn't arrive in 3-5 business days, please contact us.",
      },
    });
  } catch (error) {
    console.error("Error sending order shipping notification:", error);
  }
}

export const config: SubscriberConfig = {
  event: "order.fulfillment_created",
};
