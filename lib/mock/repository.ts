import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

import {
  AppContext,
  AppSession,
  CreateChildInput,
  CreateFamilyInput,
  CreateRecordInput,
  ChildProfile,
  FamilyGroup,
  FamilyMember,
  JoinFamilyInput,
  MemberSummary,
  RecordEvent,
  SignInInput,
  UpdateChildInput,
  UpdateRecordInput,
  UpdateSettingsInput,
  User,
  UserSettings,
} from "@/types/domain";
import {
  defaultQuickActionOrder,
  defaultVisibleTypes,
  themeOptions,
} from "@/constants/theme";
import { buildAnalytics } from "@/lib/analytics";
import { createId } from "@/lib/id";

const STORAGE_KEY = "tsumugi.mock-db.v1";

type PersistedState = {
  users: User[];
  familyGroups: FamilyGroup[];
  familyMembers: FamilyMember[];
  childProfiles: ChildProfile[];
  recordEvents: RecordEvent[];
  userSettings: UserSettings[];
  session: AppSession;
};

type Listener = () => void;

const defaultSession: AppSession = {
  currentUserId: null,
  currentFamilyGroupId: null,
  currentChildId: null,
};

const createDefaultSettings = (userId: string): UserSettings => ({
  id: createId("settings"),
  userId,
  themeColor: themeOptions[0].value,
  timelineDensity: "standard",
  visibleRecordTypes: defaultVisibleTypes,
  quickActionOrder: defaultQuickActionOrder,
  enableOneTapRecord: true,
  enableConfirmBeforeSave: false,
  updatedAt: new Date().toISOString(),
});

const seedPartnerUser = (): User => {
  const timestamp = new Date().toISOString();
  return {
    id: createId("user"),
    displayName: "パートナー",
    email: "partner@example.com",
    provider: "email",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

const seedTimelineEvents = (
  familyGroupId: string,
  childId: string,
  ownerUserId: string,
  partnerUserId: string
): RecordEvent[] => {
  const now = dayjs();
  const offsets = [0, 1, 2, 3, 4, 5, 6];
  const events: RecordEvent[] = [];

  offsets.forEach((offset, index) => {
    const base = now.subtract(offset, "day").startOf("day");
    const authorA = index % 2 === 0 ? ownerUserId : partnerUserId;
    const authorB = index % 2 === 0 ? partnerUserId : ownerUserId;

    const pushEvent = (
      hour: number,
      minute: number,
      type: RecordEvent["type"],
      extra?: Partial<RecordEvent>
    ) => {
      const timestamp = base.hour(hour).minute(minute).toISOString();
      events.push({
        id: createId("record"),
        familyGroupId,
        childId,
        type,
        timestamp,
        amountMl: extra?.amountMl,
        note: extra?.note,
        createdByUserId: extra?.createdByUserId ?? authorA,
        createdAt: timestamp,
        updatedAt: timestamp,
        deletedAt: null,
      });
    };

    pushEvent(6, 40, "milk", { amountMl: 120 });
    pushEvent(7, 15, "pee");
    pushEvent(8, 30, "sleep_start", { createdByUserId: authorB });
    pushEvent(9, 50, "sleep_end", { createdByUserId: authorB });
    pushEvent(11, 10, "poop");
    pushEvent(12, 15, "milk", { amountMl: 140, createdByUserId: authorB });
    pushEvent(15, 20, "pee");
    pushEvent(19, 5, "memo", {
      note:
        offset === 0
          ? "少し眠そう。夜は早めに寝かせたい。"
          : "機嫌は安定。午後に散歩できた。",
      createdByUserId: authorB,
    });
  });

  return events;
};

class MockRepository {
  private state: PersistedState | null = null;

  private readyPromise: Promise<void> | null = null;

  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async ensureReady() {
    if (this.readyPromise) {
      return this.readyPromise;
    }
    this.readyPromise = (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.state = JSON.parse(raw) as PersistedState;
      } else {
        this.state = {
          users: [],
          familyGroups: [],
          familyMembers: [],
          childProfiles: [],
          recordEvents: [],
          userSettings: [],
          session: defaultSession,
        };
        await this.persist();
      }
    })();
    return this.readyPromise;
  }

  private getState() {
    if (!this.state) {
      throw new Error("Repository is not ready.");
    }
    return this.state;
  }

  private async persist() {
    if (!this.state) {
      return;
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.listeners.forEach((listener) => listener());
  }

  async getSession() {
    await this.ensureReady();
    return this.getState().session;
  }

  async clearSession() {
    await this.ensureReady();
    this.getState().session = defaultSession;
    await this.persist();
    return this.getState().session;
  }

  async signIn(input: SignInInput) {
    await this.ensureReady();
    const state = this.getState();
    const timestamp = new Date().toISOString();
    const user: User = {
      id: createId("user"),
      displayName: input.displayName.trim(),
      email: input.email?.trim(),
      provider: input.provider,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    state.users.push(user);
    state.userSettings.push(createDefaultSettings(user.id));
    state.session = {
      ...state.session,
      currentUserId: user.id,
    };
    await this.persist();
    return user;
  }

  async createFamily(input: CreateFamilyInput) {
    await this.ensureReady();
    const state = this.getState();
    const timestamp = new Date().toISOString();
    const familyGroup: FamilyGroup = {
      id: createId("family"),
      name: input.familyName.trim(),
      inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
      createdByUserId: input.userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const ownerMember: FamilyMember = {
      id: createId("member"),
      familyGroupId: familyGroup.id,
      userId: input.userId,
      role: "owner",
      joinedAt: timestamp,
    };

    state.familyGroups.push(familyGroup);
    state.familyMembers.push(ownerMember);
    state.session = {
      ...state.session,
      currentFamilyGroupId: familyGroup.id,
    };
    await this.persist();
    return familyGroup;
  }

  async joinFamily(input: JoinFamilyInput) {
    await this.ensureReady();
    const state = this.getState();
    const familyGroup = state.familyGroups.find(
      (group) => group.inviteCode === input.inviteCode.trim().toUpperCase()
    );

    if (!familyGroup) {
      throw new Error("招待コードが見つかりませんでした。");
    }

    const exists = state.familyMembers.find(
      (member) =>
        member.familyGroupId === familyGroup.id && member.userId === input.userId
    );

    if (!exists) {
      state.familyMembers.push({
        id: createId("member"),
        familyGroupId: familyGroup.id,
        userId: input.userId,
        role: "member",
        joinedAt: new Date().toISOString(),
      });
    }

    const child = state.childProfiles.find((item) => item.familyGroupId === familyGroup.id);
    state.session = {
      ...state.session,
      currentFamilyGroupId: familyGroup.id,
      currentChildId: child?.id ?? null,
    };

    await this.persist();
    return familyGroup;
  }

  async createChildProfile(input: CreateChildInput) {
    await this.ensureReady();
    const state = this.getState();
    const timestamp = new Date().toISOString();
    const childProfile: ChildProfile = {
      id: createId("child"),
      familyGroupId: input.familyGroupId,
      name: input.name.trim(),
      birthDate: input.birthDate,
      sex: input.sex,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    state.childProfiles.push(childProfile);
    state.session = {
      ...state.session,
      currentChildId: childProfile.id,
    };

    const partner = seedPartnerUser();
    state.users.push(partner);
    state.userSettings.push(createDefaultSettings(partner.id));
    state.familyMembers.push({
      id: createId("member"),
      familyGroupId: input.familyGroupId,
      userId: partner.id,
      role: "member",
      joinedAt: timestamp,
    });

    if (state.session.currentUserId) {
      state.recordEvents.push(
        ...seedTimelineEvents(
          input.familyGroupId,
          childProfile.id,
          state.session.currentUserId,
          partner.id
        )
      );
    }

    await this.persist();
    return childProfile;
  }

  async updateChildProfile(childId: string, input: UpdateChildInput) {
    await this.ensureReady();
    const state = this.getState();
    const child = state.childProfiles.find((item) => item.id === childId);
    if (!child) {
      throw new Error("子どもプロフィールが見つかりません。");
    }

    if (input.name) {
      child.name = input.name.trim();
    }
    if (input.birthDate) {
      child.birthDate = input.birthDate;
    }
    if (input.sex) {
      child.sex = input.sex;
    }
    child.updatedAt = new Date().toISOString();
    await this.persist();
    return child;
  }

  async getAppContext(session: AppSession): Promise<AppContext> {
    await this.ensureReady();
    const state = this.getState();
    const currentUser = state.users.find((user) => user.id === session.currentUserId) ?? null;
    const familyGroup =
      state.familyGroups.find((group) => group.id === session.currentFamilyGroupId) ?? null;
    const childProfile =
      state.childProfiles.find((child) => child.id === session.currentChildId) ?? null;
    const settings =
      state.userSettings.find((item) => item.userId === session.currentUserId) ?? null;

    const members: MemberSummary[] = familyGroup
      ? state.familyMembers
          .filter((member) => member.familyGroupId === familyGroup.id)
          .map((member) => {
            const user = state.users.find((item) => item.id === member.userId);
            return {
              id: member.id,
              userId: member.userId,
              role: member.role,
              displayName: user?.displayName ?? "未設定",
              email: user?.email,
            };
          })
      : []
    ;

    return {
      currentUser,
      familyGroup,
      childProfile,
      members,
      settings,
    };
  }

  async getRecordsForDate(familyGroupId: string, childId: string, date: string) {
    await this.ensureReady();
    return this.getState().recordEvents
      .filter(
        (event) =>
          !event.deletedAt &&
          event.familyGroupId === familyGroupId &&
          event.childId === childId &&
          dayjs(event.timestamp).format("YYYY-MM-DD") === date
      )
      .sort((a, b) => dayjs(a.timestamp).valueOf() - dayjs(b.timestamp).valueOf());
  }

  async getAnalytics(familyGroupId: string, childId: string, anchorDate: string, days = 7) {
    await this.ensureReady();
    const events = this.getState().recordEvents.filter(
      (event) =>
        !event.deletedAt &&
        event.familyGroupId === familyGroupId &&
        event.childId === childId
    );
    return buildAnalytics(events, anchorDate, days);
  }

  async createRecord(input: CreateRecordInput) {
    await this.ensureReady();
    const record: RecordEvent = {
      id: createId("record"),
      familyGroupId: input.familyGroupId,
      childId: input.childId,
      type: input.type,
      timestamp: input.timestamp,
      amountMl: input.amountMl,
      note: input.note,
      createdByUserId: input.createdByUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };
    this.getState().recordEvents.push(record);
    await this.persist();
    return record;
  }

  async updateRecord(input: UpdateRecordInput) {
    await this.ensureReady();
    const record = this.getState().recordEvents.find((item) => item.id === input.id);
    if (!record) {
      throw new Error("編集対象の記録が見つかりません。");
    }
    record.timestamp = input.timestamp;
    record.amountMl = input.amountMl;
    record.note = input.note;
    record.updatedAt = new Date().toISOString();
    await this.persist();
    return record;
  }

  async deleteRecord(recordId: string) {
    await this.ensureReady();
    const record = this.getState().recordEvents.find((item) => item.id === recordId);
    if (!record) {
      throw new Error("削除対象の記録が見つかりません。");
    }
    record.deletedAt = new Date().toISOString();
    record.updatedAt = record.deletedAt;
    await this.persist();
    return record;
  }

  async saveSettings(userId: string, input: UpdateSettingsInput) {
    await this.ensureReady();
    const settings = this.getState().userSettings.find((item) => item.userId === userId);
    if (!settings) {
      throw new Error("設定が見つかりません。");
    }
    Object.assign(settings, input, { updatedAt: new Date().toISOString() });
    await this.persist();
    return settings;
  }
}

export const repository = new MockRepository();
