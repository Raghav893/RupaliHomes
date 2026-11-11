"use client";

import { createContext, useContext, useReducer, type ReactNode } from "react";
import type { Property } from "@/types";
import { MAX_COMPARE_PROPERTIES } from "@/lib/property-comparison";

interface CompareContextType {
  compareItems: Property[];
  addToCompare: (property: Property) => void;
  removeFromCompare: (id: number) => void;
  clearCompare: () => void;
  isCompareOpen: boolean;
  setIsCompareOpen: (open: boolean) => void;
  compareNotice: string;
  dismissCompareNotice: () => void;
}

interface CompareState {
  items: Property[];
  open: boolean;
  notice: string;
}

type CompareAction =
  | { type: "add"; property: Property }
  | { type: "remove"; id: number }
  | { type: "open"; open: boolean }
  | { type: "clear" }
  | { type: "dismiss" };

const initialState: CompareState = { items: [], open: false, notice: "" };

function compareReducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "add":
      if (action.property.id === undefined) return { ...state, notice: "This property cannot be added to the comparison yet." };
      if (state.items.some((property) => property.id === action.property.id)) return state;
      if (state.items.length >= MAX_COMPARE_PROPERTIES) return { ...state, notice: "You can compare up to 3 properties. Remove one to add another." };
      return { ...state, items: [...state.items, action.property], notice: "" };
    case "remove": {
      const items = state.items.filter((property) => property.id !== action.id);
      return { items, open: items.length ? state.open : false, notice: "" };
    }
    case "open": return { ...state, open: state.items.length > 0 && action.open, notice: "" };
    case "clear": return initialState;
    case "dismiss": return { ...state, notice: "" };
  }
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(compareReducer, initialState);
  return (
    <CompareContext.Provider
      value={{
        compareItems: state.items,
        addToCompare: (property) => dispatch({ type: "add", property }),
        removeFromCompare: (id) => dispatch({ type: "remove", id }),
        clearCompare: () => dispatch({ type: "clear" }),
        isCompareOpen: state.open,
        setIsCompareOpen: (open) => dispatch({ type: "open", open }),
        compareNotice: state.notice,
        dismissCompareNotice: () => dispatch({ type: "dismiss" }),
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
