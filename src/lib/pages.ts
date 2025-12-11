// Static pages data (terms, privacy, etc.)
// Add page objects here with slug, title, subtitle, and content

export type PageData = {
  slug: string
  title: string
  subtitle?: string
  content: string // Plain text or HTML content
  image?: {
    src: string
    alt?: string
  }
}

export const pages: PageData[] = [
  {
    slug: "shipping",
    title: "Shipping & Return Policy",
    content: `The shipping time for your order is 5-15 business days to the nearest pickup point. Shipping costs will be automatically added during the checkout process.

You can check the cost of each shipment depending on the country below:

COUNTRY/PRICES (EUR)
Cyprus 2.00-4.00, Greece 7.00-24.00

Once the package has been shipped, you will receive an email with the tracking number so you can track it.

At φως, we handcraft each piece with care, valuing every unique detail. As a result, our jewelry may have small imperfections that make each item one-of-a-kind. These variations are part of the design, and we do not offer refunds for them.

If your product arrives damaged or opened, we will take responsibility and cover return shipping costs, provided the issue is our mistake. In this case, please contact us via email or Instagram. Please ensure that the product is the correct size before purchasing.

Note: Once the order is confirmed, you will receive a confirmation email.
Please check your Spam or Junk folder if you don't see it in your main inbox.`,
  },
  {
    slug: "silver-care",
    title: "Silver Care",
    content: `To keep your silver jewelry in excellent condition, store it in a dry, cool place away from moisture and harsh chemicals. Clean it with a soft cloth and avoid exposing it to perfumes or lotions.

SILVER CLEANING

If you notice your silver piece losing its shine, you can use at home, friendly and non-toxic methods to clean it. A simple mix of lemon juice and baking soda diluted with some warm water applied gently with a soft-bristled toothbrush will help your piece brighten and regain its original shine. Rinse with water and dry thoroughly with a gentle cloth and to take it a step further you can use a polishing cloth and gently rub until shiny.`,
  },
  {
    slug: "ring-size",
    title: "Ring Size Guide",
    content: `Method 1
1. Take a ring that fits you well and measure the inside diameter (Ø) in millimeters using a ruler.

Method 2
1. Wrap a piece of thread or a measuring tape loosely around your finger.
2. Mark the end of the thread (or tape) with a pen.
3. Lay the thread flat and measure its length with a ruler.`,
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    subtitle: "Last Updated: 11/12/2025",
    content: `1. Introduction
Welcome to φως ("we," "our," or "us"). By accessing and using our website, you agree to be bound by these Terms and Conditions and our Privacy Policy.

2. Use of Website

2.1 Prohibited Activities
You agree not to:
• Use the website for any unlawful purpose
• Attempt to gain unauthorized access to any portion of the website
• Copy, modify, or distribute our content without written permission
• Upload or transmit any harmful code or malware

3. Products and Services

3.1 Product Information
• All product descriptions, specifications, and prices are subject to change without notice
• We strive to display accurate product colors, but we cannot guarantee that your device's display accurately reflects the actual colors
• All jewelry pieces are subject to availability

3.2 Pricing and Payment
• All prices are in euros (€) and include applicable taxes
• Payments are processed securely via Stripe
• We reserve the right to refuse or cancel any order for any reason
• Payment must be made in full before order processing begins

4. Shipping and Returns

4.1 Shipping Policy
• Orders are typically processed within 5-15 business days
• Shipping times and costs vary by location
• We are not responsible for customs duties or import taxes

4.2 Return Policy
Please refer to our Return & Refund Policy for full details.

5. Privacy Policy

5.1 Information We Collect
We collect:
• Personal information (name, address, email, tel number)
• Payment information
• Order history
• Device information only when errors occur to help us resolve technical issues

5.2 How We Use Your Information
We use your information to:
• Process and fulfill your orders
• Send transactional and functional emails about your purchases
• Improve our website and services
• Comply with legal obligations

5.3 Information Sharing
We may share your information with:
• Payment processors and shipping partners
• Service providers who assist our operations
• Law enforcement when required by law

We never sell your personal information to third parties.

5.4 Detailed Information on the Processing of Personal Data
Personal Data is collected for the following purposes and using the following services:

Analytics
The services contained in this section enable the Owner to monitor and analyze web traffic and can be used to keep track of User behavior.

Google Analytics (Google LLC)
Google Analytics is a web analysis service provided by Google LLC ("Google"). Google utilizes the Data collected to track and examine the use of this Application, to prepare reports on its activities and share them with other Google services.

Google may use the Data collected to contextualize and personalize the ads of its own advertising network.

Personal Data collected: Cookies; Usage Data.
Place of processing: United States – Privacy Policy – Opt Out. Privacy Shield participant.

5.5 Data Security
We implement appropriate technical and organizational measures to protect your personal information.

6. Intellectual Property
All content, including images, text, and designs, is our property and protected by copyright laws.

7. Limitation of Liability

7.1 Warranty Disclaimer
Products are provided "as is" without any warranties, express or implied.

7.2 Limitation of Liability
We shall not be liable for any indirect, incidental, special, or consequential damages.

8. Changes to Terms
We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.

9. Contact Information
For questions about these terms or our privacy policy, contact us at:
Email: contact@aistudiocy.com

10. Governing Law
These terms are governed by the laws of Cyprus, without regard to its conflict of law principles.`,
  },
]

export function getPageBySlug(slug: string): PageData | undefined {
  return pages.find((page) => page.slug === slug)
}

export function getAllPageSlugs(): string[] {
  return pages.map((page) => page.slug)
}
