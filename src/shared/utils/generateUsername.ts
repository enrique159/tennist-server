import * as dayjs from 'dayjs';

export const generateUsername = (value: string): string => {
  const date = dayjs().format('YYYYMMDD');
  return value + date + Math.floor(Math.random() * 1000);
};
