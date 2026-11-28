import { signal } from "@preact/signals";
import type { Investments } from "#/types.d.ts";
import { invoke } from "@tauri-apps/api/core";

export const unarchivedInvestments = signal<Investments[]>([]);

export const refetchInvestments = async () => {
  try {
    unarchivedInvestments.value = await investmentsQuery.get
      .all_unarchived();
  } catch (error) {
    console.error("Failed to fetch unarchived investments:", error);
  }
};

export const investmentsQuery = {
  get: {
    all_unarchived: () => invoke<Investments[]>("get_unarchived_investments"),
  },
  post: (
    fundTypeId: number,
    name: string,
    unit: string,
    currentBid: number,
    lastUpdated: string,
  ) =>
    invoke<number>("create_investment", {
      fundTypeId,
      name,
      unit,
      currentBid,
      lastUpdated,
    }),
};
