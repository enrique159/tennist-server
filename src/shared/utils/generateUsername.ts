export const generateUsername = (email: string): string => {
  return email.split('@')[0] + Math.floor(Math.random() * 1000);
};
