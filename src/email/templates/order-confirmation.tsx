import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OrderConfirmationEmailProps {
  order: {
    displayId: string;
    email: string;
    items: Array<{
      productTitle: string;
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
  };
  preview: string;
  message: string;
}

export function OrderConfirmationEmail({
  order,
  preview,
  message,
}: OrderConfirmationEmailProps) {
  const siteUrl =
    process.env.FRONTEND_URL || "http://localhost:3000";

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Img
          alt="φως"
          style={styles.logo}
          height={100}
          src={`${siteUrl}/logo.png`}
        />
        <Container style={styles.container}>
          <Section>
            <Text style={styles.heading}>{preview}</Text>
            <Text style={styles.text}>
              Dear {order.shippingAddress.firstName}{" "}
              {order.shippingAddress.lastName},
            </Text>
            <Text style={styles.message}>{message}</Text>

            <Hr style={styles.hr} />

            <Text style={styles.sectionTitle}>Order Summary</Text>
            <Text style={styles.text}>
              Order Date: {new Date(order.createdAt).toLocaleDateString()}
            </Text>
            <Text style={styles.text}>Total: {order.total.toFixed(2)} EUR</Text>

            <Hr style={styles.hr} />

            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <Text style={styles.text}>{order.shippingAddress.address1}</Text>
            <Text style={styles.text}>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode},{" "}
              {order.shippingAddress.countryCode.toUpperCase()}
            </Text>

            {order.shippingMethod?.name && (
              <>
                <Hr style={styles.hr} />
                <Text style={styles.sectionTitle}>Shipping Method</Text>
                <Text style={styles.text}>
                  {order.shippingMethod.name} -{" "}
                  {(order.shippingMethod.amount || 0).toFixed(2)} EUR
                </Text>
              </>
            )}

            <Hr style={styles.hr} />

            <Text style={styles.sectionTitle}>Items</Text>
            {order.items.map((item, index) => (
              <Text key={index} style={styles.text}>
                {item.productTitle} x {item.quantity} -{" "}
                {item.unitPrice.toFixed(2)} EUR
              </Text>
            ))}

            <Hr style={styles.hr} />

            <Text style={styles.text}>
              Subtotal: {order.subtotal.toFixed(2)} EUR
            </Text>
            {order.discount && order.discount > 0 && (
              <Text style={{ ...styles.text, color: "#22c55e" }}>
                Discount{order.couponCode ? ` (${order.couponCode})` : ""}:{" "}
                -{order.discount.toFixed(2)} EUR
              </Text>
            )}
            <Text style={styles.text}>
              Shipping: {order.shippingTotal.toFixed(2)} EUR
            </Text>
            <Text style={{ ...styles.text, fontWeight: "bold" }}>
              Total: {order.total.toFixed(2)} EUR
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "sans-serif",
    padding: "40px 0",
  },
  logo: {
    margin: "auto",
    padding: "40px",
    display: "block" as const,
  },
  container: {
    border: "1px solid #333",
    borderRadius: "4px",
    margin: "auto",
    padding: "40px",
    maxWidth: "500px",
    backgroundColor: "#111",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "bold" as const,
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  text: {
    fontSize: "14px",
    lineHeight: "24px",
    margin: "8px 0",
  },
  message: {
    fontSize: "16px",
    lineHeight: "24px",
    marginBottom: "16px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold" as const,
    marginTop: "16px",
    marginBottom: "8px",
  },
  hr: {
    borderColor: "#333",
    margin: "24px 0",
  },
};

export default OrderConfirmationEmail;
