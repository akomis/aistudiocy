import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import {
  INotificationModuleService,
  IOrderModuleService,
} from "@medusajs/types";
import { Modules } from "@medusajs/utils";
import { EmailTemplates } from "../modules/email-notifications/templates";

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION);
  const orderModuleService: IOrderModuleService = container.resolve(
    Modules.ORDER
  );

  const order = await orderModuleService.retrieveOrder(data.id, {
    relations: ["items", "summary", "shipping_address", "shipping_methods"],
  });
  const shippingAddress = await (
    orderModuleService as any
  ).orderAddressService_.retrieve(order.shipping_address.id);

  // Notify customer
  try {
    await notificationModuleService.createNotifications({
      to: order.email,
      channel: "email",
      template: EmailTemplates.ORDER,
      data: {
        emailOptions: {
          replyTo: process.env.ADMIN_EMAIL,
          subject: "Your order has been placed",
        },
        order,
        shippingAddress,
        preview: "Thank you for your order",
        message:
          "Your order has been placed successfully. You should expect a confirmation email soon about the shipment of your order.",
      },
    });
  } catch (error) {
    console.error(
      "Error sending order confirmation notification to customer:",
      error
    );
  }

  // Notify Admin
  try {
    await notificationModuleService.createNotifications({
      to: process.env.ADMIN_EMAIL,
      channel: "email",
      template: EmailTemplates.ORDER,
      data: {
        emailOptions: {
          replyTo: process.env.ADMIN_EMAIL,
          subject: "New order has been placed",
        },
        order,
        shippingAddress: {
          ...shippingAddress,
          first_name: "Admin",
          last_name: "",
        },
        preview: "New order",
        message: `Order has been placed successfully by ${order.email}.`,
      },
    });
  } catch (error) {
    console.error(
      "Error sending order confirmation notification to admin:",
      error
    );
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
};
