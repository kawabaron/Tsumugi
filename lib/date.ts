import dayjs from "dayjs";
import "dayjs/locale/ja";

dayjs.locale("ja");

export const nowIso = () => dayjs().toISOString();

export const formatDayLabel = (date: string) => dayjs(date).format("M月D日 ddd");

export const formatHeaderDate = (date: string) => dayjs(date).format("YYYY年M月D日");

export const formatTime = (dateTime: string) => dayjs(dateTime).format("HH:mm");

export const shiftDay = (date: string, amount: number) =>
  dayjs(date).add(amount, "day").format("YYYY-MM-DD");

export const todayKey = () => dayjs().format("YYYY-MM-DD");

export const combineDateAndTime = (date: string, timeValue: string) => {
  const safe = /^\d{2}:\d{2}$/.test(timeValue) ? timeValue : "12:00";
  return dayjs(`${date} ${safe}`).toISOString();
};

export const timeInputFromIso = (value: string) => dayjs(value).format("HH:mm");

export const birthDateInput = (value?: string) =>
  value ? dayjs(value).format("YYYY-MM-DD") : "";

export const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (hours === 0) {
    return `${remain}分`;
  }
  return `${hours}時間${remain > 0 ? `${remain}分` : ""}`;
};
