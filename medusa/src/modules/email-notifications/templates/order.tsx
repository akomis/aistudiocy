import { OrderAddressDTO, OrderDTO } from "@medusajs/types/dist/order/common";
import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";
import { Base } from "./base";

export const ORDER = "order";

interface OrderPreviewProps {
  order: OrderDTO & {
    display_id: string;
    summary: { raw_current_order_total: { value: number } };
  };
  shippingAddress: OrderAddressDTO;
  message?: string;
}

export interface OrderTemplateProps {
  order: OrderDTO & {
    display_id: string;
    summary: { raw_current_order_total: { value: number } };
  };
  shippingAddress: OrderAddressDTO;
  preview?: string;
  message?: string;
}

export const isOrderTemplateData = (data: any): data is OrderTemplateProps =>
  typeof data.order === "object" && typeof data.shippingAddress === "object";

export const OrderTemplate: React.FC<OrderTemplateProps> & {
  PreviewProps: OrderPreviewProps;
} = ({
  order,
  shippingAddress,
  preview = "Your order at φως",
  message,
}) => {
  return (
    <Base preview={preview}>
      <Section>
        <Text className="font-bold text-4xl text-center border-2 mb-10">
          {preview}
        </Text>
        <Text>
          Dear {shippingAddress.first_name} {shippingAddress.last_name},
        </Text>
        <Text className="mb-4 text-lg">{message}</Text>

        <Hr className="mt-10 mb-5" />

        <Text className="text-lg font-bold mb-2">Order Summary</Text>
        <Text className="mb-1">Order ID: {order.display_id}</Text>
        <Text className="mb-1">
          Order Date: {new Date(order.created_at).toLocaleDateString()}
        </Text>
        <Text className="mb-5">
          Total: {order.summary.raw_current_order_total.value}{" "}
          {order.currency_code.toUpperCase()}
        </Text>

        <Hr className="my-5" />

        <Text className="text-lg font-bold mb-2">Shipping Address</Text>
        <Text className="mb-1">{shippingAddress.address_1}</Text>
        <Text className="mb-1">
          {shippingAddress.city}, {shippingAddress.province}{" "}
          {shippingAddress.postal_code},{" "}
          {shippingAddress.country_code.toUpperCase()}
        </Text>

        <Text>
          Shipping Cost: {order?.shipping_methods[0]?.amount.toString()}{" "}
          {order.currency_code.toUpperCase()}
        </Text>

        <Hr className="my-5" />

        <Text className="text-lg font-bold mb-4">Order</Text>

        <div className="w-full border border-gray-200 my-2">
          <div
            className="flex justify-between p-2 "
            style={{ borderBottom: "2px solid white" }}
          >
            <Text className="font-bold">Item</Text>
            <Text className="font-bold">Quantity</Text>
            <Text className="font-bold">Price</Text>
          </div>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between p-[2px]"
              style={{ borderBottom: "1px solid white" }}
            >
              <Text>
                {item.title} - {item.product_title}
              </Text>
              <Text>{item.quantity}</Text>
              <Text>
                {item.unit_price} {order.currency_code.toUpperCase()}
              </Text>
            </div>
          ))}
        </div>
      </Section>
    </Base>
  );
};

OrderTemplate.PreviewProps = {
  order: {
    id: "test-order-id",
    display_id: "ORD-123",
    created_at: new Date().toISOString(),
    email: "test@example.com",
    currency_code: "EUR",
    items: [
      {
        id: "item-1",
        title: "Item 1",
        product_title: "Product 1",
        quantity: 2,
        unit_price: 10,
      },
      {
        id: "item-2",
        title: "Item 2",
        product_title: "Product 2",
        quantity: 1,
        unit_price: 25,
      },
    ],
    shipping_address: {
      first_name: "Test",
      last_name: "User",
      address_1: "123 Main St",
      city: "Anytown",
      province: "CA",
      postal_code: "12345",
      country_code: "US",
    },
    summary: { raw_current_order_total: { value: 45 } },
  },
  shippingAddress: {
    first_name: "Test",
    last_name: "User",
    address_1: "123 Main St",
    city: "Anytown",
    province: "CA",
    postal_code: "12345",
    country_code: "US",
  },
  message:
    "Your order has been placed successfully. You should expect a confirmation email soon about the shipment of your order.",
} as OrderPreviewProps;

export default OrderTemplate;
