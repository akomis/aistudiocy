export const get = async (key: string, params = {}) => {
  if (!process.env.NEXT_PUBLIC_STRAPI_URL) {
    throw new Error("NEXT_PUBLIC_STRAPI_URL is not defined");
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${key}?populate=*&${queryString ? queryString : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
