"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Property } from "@/types";

interface CompareContextType {
  compareItems: Property[];
  addToCompare: (property: Property) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareItems, setCompareItems] = useState<Property[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const addToCompare = (property: Property) => {
    setCompareItems((prev) => {
      if (prev.find((p) => p.id === property.id)) return prev;
      if (prev.length >= 3) {
        alert("You can only compare up to 3 properties.");
        return prev;
      }
      setIsCompareOpen(true);
      return [...prev, property];
    });
  };

  const removeFromCompare = (id: number) => {
    setCompareItems((prev) => {
      const newItems = prev.filter((p) => p.id !== id);
      if (newItems.length === 0) setIsCompareOpen(false);
      return newItems;
    });
  };

  const clearCompare = () => {
    setCompareItems([]);
    setIsCompareOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error("useCompare must be used within a CompareProvider");
  }
  return context;
}
