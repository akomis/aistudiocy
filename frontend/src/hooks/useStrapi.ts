"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useStrapi = (key: string, params = {}) => {
  const queryFn = async () => {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/${key}`,
      {
        params,
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_STRAPI_TOKEN}`,
        },
      }
    );

    return data;
  };

  return useQuery({ queryKey: [key], queryFn });
};

export default useStrapi;
