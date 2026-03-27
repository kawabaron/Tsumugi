import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { repository } from "@/lib/mock/repository";
import { useAppStore } from "@/store/app-store";
import {
  CreateChildInput,
  CreateFamilyInput,
  CreateRecordInput,
  JoinFamilyInput,
  SignInInput,
  UpdateChildInput,
  UpdateRecordInput,
  UpdateSettingsInput,
} from "@/types/domain";

export const useAppContextQuery = () => {
  const session = useAppStore((state) => state.session);

  return useQuery({
    queryKey: ["app-context", session],
    queryFn: () => repository.getAppContext(session),
  });
};

export const useRecordsQuery = () => {
  const session = useAppStore((state) => state.session);
  const selectedDate = useAppStore((state) => state.selectedDate);

  return useQuery({
    queryKey: ["records", session.currentFamilyGroupId, session.currentChildId, selectedDate],
    enabled: Boolean(session.currentFamilyGroupId && session.currentChildId),
    queryFn: () =>
      repository.getRecordsForDate(
        session.currentFamilyGroupId as string,
        session.currentChildId as string,
        selectedDate
      ),
  });
};

export const useAnalyticsQuery = (days = 7) => {
  const session = useAppStore((state) => state.session);
  const selectedDate = useAppStore((state) => state.selectedDate);

  return useQuery({
    queryKey: [
      "analytics",
      session.currentFamilyGroupId,
      session.currentChildId,
      selectedDate,
      days,
    ],
    enabled: Boolean(session.currentFamilyGroupId && session.currentChildId),
    queryFn: () =>
      repository.getAnalytics(
        session.currentFamilyGroupId as string,
        session.currentChildId as string,
        selectedDate,
        days
      ),
  });
};

export const useSessionActions = () => {
  const queryClient = useQueryClient();
  const setSession = useAppStore((state) => state.setSession);
  const resetSession = useAppStore((state) => state.resetSession);

  const refreshSession = async () => {
    const session = await repository.getSession();
    setSession(session);
    await queryClient.invalidateQueries();
  };

  return {
    signIn: useMutation({
      mutationFn: (input: SignInInput) => repository.signIn(input),
      onSuccess: refreshSession,
    }),
    signOut: useMutation({
      mutationFn: () => repository.clearSession(),
      onSuccess: async () => {
        resetSession();
        await queryClient.invalidateQueries();
      },
    }),
    createFamily: useMutation({
      mutationFn: (input: CreateFamilyInput) => repository.createFamily(input),
      onSuccess: refreshSession,
    }),
    joinFamily: useMutation({
      mutationFn: (input: JoinFamilyInput) => repository.joinFamily(input),
      onSuccess: refreshSession,
    }),
    createChild: useMutation({
      mutationFn: (input: CreateChildInput) => repository.createChildProfile(input),
      onSuccess: refreshSession,
    }),
  };
};

export const useRecordActions = () => {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["records"] });
    await queryClient.invalidateQueries({ queryKey: ["analytics"] });
  };

  return {
    createRecord: useMutation({
      mutationFn: (input: CreateRecordInput) => repository.createRecord(input),
      onSuccess: invalidate,
    }),
    updateRecord: useMutation({
      mutationFn: (input: UpdateRecordInput) => repository.updateRecord(input),
      onSuccess: invalidate,
    }),
    deleteRecord: useMutation({
      mutationFn: (recordId: string) => repository.deleteRecord(recordId),
      onSuccess: invalidate,
    }),
  };
};

export const useSettingsActions = () => {
  const queryClient = useQueryClient();

  return {
    saveSettings: useMutation({
      mutationFn: ({ userId, input }: { userId: string; input: UpdateSettingsInput }) =>
        repository.saveSettings(userId, input),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["app-context"] });
      },
    }),
    updateChildProfile: useMutation({
      mutationFn: ({ childId, input }: { childId: string; input: UpdateChildInput }) =>
        repository.updateChildProfile(childId, input),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["app-context"] });
      },
    }),
  };
};
