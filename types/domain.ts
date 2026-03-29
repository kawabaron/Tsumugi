export type AuthProvider = "apple" | "email";

export type RecordEventType =
  | "milk"
  | "pee"
  | "poop"
  | "sleep_start"
  | "sleep_end"
  | "memo";

export type TimelineDensity = "comfortable" | "standard" | "compact";
export type TimeMinuteInterval = 1 | 5;
export type PoopAmount = "tiny" | "small" | "normal" | "large";
export type PoopHardness = "diarrhea" | "soft" | "normal" | "firm";
export type PoopColor = "white" | "yellow" | "orange" | "brown" | "green" | "red" | "black";

export type User = {
  id: string;
  displayName: string;
  email?: string;
  provider: AuthProvider;
  createdAt: string;
  updatedAt: string;
};

export type FamilyGroup = {
  id: string;
  name: string;
  inviteCode: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
};

export type FamilyMember = {
  id: string;
  familyGroupId: string;
  userId: string;
  role: "owner" | "member";
  joinedAt: string;
};

export type ChildProfile = {
  id: string;
  familyGroupId: string;
  name: string;
  birthDate: string;
  sex?: "male" | "female" | "other";
  createdAt: string;
  updatedAt: string;
};

export type RecordEvent = {
  id: string;
  familyGroupId: string;
  childId: string;
  type: RecordEventType;
  timestamp: string;
  amountMl?: number;
  poopAmount?: PoopAmount;
  poopHardness?: PoopHardness;
  poopColor?: PoopColor;
  note?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
};

export type UserSettings = {
  id: string;
  userId: string;
  themeColor: string;
  timelineDensity: TimelineDensity;
  timeMinuteInterval: TimeMinuteInterval;
  visibleRecordTypes: RecordEventType[];
  quickActionOrder: RecordEventType[];
  enableOneTapRecord: boolean;
  enableConfirmBeforeSave: boolean;
  updatedAt: string;
};

export type AppSession = {
  currentUserId: string | null;
  currentFamilyGroupId: string | null;
  currentChildId: string | null;
};

export type MemberSummary = {
  id: string;
  userId: string;
  role: FamilyMember["role"];
  displayName: string;
  email?: string;
};

export type AppContext = {
  currentUser: User | null;
  familyGroup: FamilyGroup | null;
  childProfile: ChildProfile | null;
  members: MemberSummary[];
  settings: UserSettings | null;
};

export type TodaySummary = {
  totalMilkMl: number;
  peeCount: number;
  poopCount: number;
  sleepMinutes: number;
};

export type MetricPoint = {
  date: string;
  label: string;
  milkMl: number;
  peeCount: number;
  poopCount: number;
  sleepMinutes: number;
};

export type AnalyticsPayload = {
  summary: TodaySummary;
  points: MetricPoint[];
};

export type SignInInput = {
  displayName: string;
  email?: string;
  provider: AuthProvider;
};

export type CreateFamilyInput = {
  userId: string;
  familyName: string;
};

export type JoinFamilyInput = {
  userId: string;
  inviteCode: string;
};

export type CreateChildInput = {
  familyGroupId: string;
  name: string;
  birthDate: string;
  sex?: ChildProfile["sex"];
};

export type UpdateChildInput = Partial<Omit<CreateChildInput, "familyGroupId">>;

export type CreateRecordInput = {
  familyGroupId: string;
  childId: string;
  createdByUserId: string;
  type: RecordEventType;
  timestamp: string;
  amountMl?: number;
  poopAmount?: PoopAmount;
  poopHardness?: PoopHardness;
  poopColor?: PoopColor;
  note?: string;
};

export type UpdateRecordInput = {
  id: string;
  timestamp: string;
  amountMl?: number;
  poopAmount?: PoopAmount;
  poopHardness?: PoopHardness;
  poopColor?: PoopColor;
  note?: string;
};

export type UpdateSettingsInput = Partial<
  Omit<UserSettings, "id" | "userId" | "updatedAt">
>;
