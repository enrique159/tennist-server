export const extractFilenameFromUrl = (url: string): string | null => {
  if (!url) return null;

  try {
    const urlParts = url.split('/');
    return urlParts[urlParts.length - 1];
  } catch (error) {
    return null;
  }
};
