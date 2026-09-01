import { LEGAL_PDFS } from "@/lib/legal";
import { render } from "@react-email/components";
import { readFile } from "fs/promises";
import path from "path";
import type { Payload } from "payload";
import { OrderConfirmationEmail } from "./templates/order-confirmation";

/**
 * Clause 2.4 of the General Conditions requires the accepted conditions to be
 * supplied on a durable medium with the order confirmation, so the signed PDF
 * travels with the email. A missing file must not block the confirmation, so a
 * read failure is logged and the email goes out without the attachment.
 */
async function generalConditionsAttachment(payload: Payload) {
  const filename = LEGAL_PDFS.en;

  try {
    const content = await readFile(path.join(process.cwd(), "public", filename));

    return [{ filename: path.basename(filename), content }];
  } catch (error) {
    payload.logger.error(
      { err: error, filename },
      "Could not attach the General Conditions to the order confirmation",
    );

    return undefined;
  }
}

interface Order {
  displayId: string;
  email: string;
  items: Array<{
    productId: string;
    productTitle: string;
    productDescription?: string;
    thumbnail?: string;
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    postalCode: string;
    countryCode: string;
    phone?: string;
  };
  shippingMethod?: {
    name?: string;
    amount?: number;
  };
  subtotal: number;
  discount?: number | null;
  couponCode?: string | null;
  shippingTotal: number;
  total: number;
  createdAt: string;
}

export async function sendOrderConfirmationEmail(
  order: Order,
  payload: Payload
) {
  const html = await render(
    OrderConfirmationEmail({
      order,
      preview: "Thank you for your order",
      message:
        "Your order has been placed successfully. You will receive another email when your order ships.",
    })
  );

  // Send to customer
  await payload.sendEmail({
    to: order.email,
    subject: `φως - Your order has been placed`,
    html,
    attachments: await generalConditionsAttachment(payload),
  });

  // Send notification to admin
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    const adminHtml = await render(
      OrderConfirmationEmail({
        order: {
          ...order,
          shippingAddress: {
            ...order.shippingAddress,
            firstName: "Admin",
            lastName: "",
          },
        },
        preview: "New order received",
        message: `A new order has been placed by ${order.email}.`,
      })
    );

    await payload.sendEmail({
      to: adminEmail,
      subject: `φως - New order: ${order.displayId}`,
      html: adminHtml,
    });
  }
}

export async function sendOrderShippedEmail(order: Order, payload: Payload) {
  const html = await render(
    OrderConfirmationEmail({
      order,
      preview: "Your order has shipped",
      message:
        "Your order has been shipped and is on its way to you. If you do not hear from the delivery provider soon, please contact us.",
    })
  );

  await payload.sendEmail({
    to: order.email,
    subject: `φως - Your order has been shipped`,
    html,
  });
}
