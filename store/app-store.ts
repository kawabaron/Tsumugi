import { create } from "zustand";

import { AppSession } from "@/types/domain";
import { shiftDay, todayKey } from "@/lib/date";

type AppStore = {
  bootstrapped: boolean;
  session: AppSession;
  selectedDate: string;
  setBootstrapped: (value: boolean) => void;
  setSession: (session: AppSession) => void;
  resetSession: () => void;
  setSelectedDate: (date: string) => void;
  shiftSelectedDate: (amount: number) => void;
};

const defaultSession: AppSession = {
  currentUserId: null,
  currentFamilyGroupId: null,
  currentChildId: null,
};

export const useAppStore = create<AppStore>((set) => ({
  bootstrapped: false,
  session: defaultSession,
  selectedDate: todayKey(),
  setBootstrapped: (value) => set({ bootstrapped: value }),
  setSession: (session) => set({ session }),
  resetSession: () => set({ session: defaultSession, selectedDate: todayKey() }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  shiftSelectedDate: (amount) =>
    set((state) => ({ selectedDate: shiftDay(state.selectedDate, amount) })),
}));
