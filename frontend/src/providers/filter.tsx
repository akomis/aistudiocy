"use client";

import React, { createContext, useState } from "react";

type Props = {
  children: React.ReactNode;
};

type FilterContextType = {
  id: string | null;
  setId: React.Dispatch<React.SetStateAction<string | null>>;
};

const FilterContext = createContext<FilterContextType>({
  id: null,
  setId: () => {},
});

export const FilterProvider = ({ children }: Props) => {
  const [id, setId] = useState<string | null>(null);

  return (
    <FilterContext.Provider value={{ id, setId }}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext;
