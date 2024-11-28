import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const useStrapi = (key: string, params = {}) => {
  const fetchData = async () => {
    const { data } = await axios.get(`${process.env.STRAPI_URL}/${key}`, {
      params,
    });

    return data;
  };

  // @ts-ignore
  return useQuery([key], fetchData);
};

export default useStrapi;
