import { merge } from "lodash";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { createCurrentTaskSlice, CurrentTaskSlice } from "./currentTask";
import { createUiSlice, UiSlice } from "./ui";
import { createSettingsSlice, SettingsSlice } from "./settings";
import { createHitlSlice, HitlSlice } from "./hitl";
import { findBestMatchingModel } from "../helpers/aiSdkUtils";

export type StoreType = {
  currentTask: CurrentTaskSlice;
  ui: UiSlice;
  settings: SettingsSlice;
  hitl: HitlSlice;
};

export type MyStateCreator<T> = StateCreator<
  StoreType,
  [["zustand/immer", never]],
  [],
  T
>;

export const useAppState = create<StoreType>()(
  persist(
    immer(
      devtools((...a) => ({
        currentTask: createCurrentTaskSlice(...a),
        ui: createUiSlice(...a),
        settings: createSettingsSlice(...a),
        hitl: createHitlSlice(...a),
      })),
    ),
    {
      name: "app-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ui: {
          instructions: state.ui.instructions,
        },
        settings: {
          openAIKey: state.settings.openAIKey,
          anthropicKey: state.settings.anthropicKey,
          geminiKey: state.settings.geminiKey,
          openAIBaseUrl: state.settings.openAIBaseUrl,
          anthropicBaseUrl: state.settings.anthropicBaseUrl,
          agentMode: state.settings.agentMode,
          selectedModel: state.settings.selectedModel,
          voiceMode: state.settings.voiceMode,
          customKnowledgeBase: state.settings.customKnowledgeBase,
          hitlRules: state.settings.hitlRules,
        },
      }),
      merge: (persistedState, currentState) => {
        const result = merge(currentState, persistedState);
        result.settings.selectedModel = findBestMatchingModel(
          result.settings.selectedModel,
          result.settings.agentMode,
          result.settings.openAIKey,
          result.settings.anthropicKey,
          result.settings.geminiKey,
        );
        return result;
      },
    },
  ),
);

// @ts-expect-error used for debugging
window.getState = useAppState.getState;
