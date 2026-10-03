const decodeEntities = (value: string) => {
  if (typeof document === "undefined") return value;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

export const cleanWebText = (value?: string) => {
  if (!value) return "";

  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, "$1")
    .replace(/(?:Page\s*\d+\s*){2,}/gi, " ")
    .replace(/Page\s*\d+/gi, " ")
    .replace(/\|{2,}|\|\s*\|/g, " ")
    .replace(/_{1,3}\s*List of companies\b/gi, " ")
    .replace(/(^|\s)#{1,6}\s*/g, " ")
    .replace(/\*{1,3}|_{2,3}|`{1,3}/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const cleanWebDescription = (value?: string) => {
  const cleaned = cleanWebText(value);
  if (!cleaned || !/[a-z0-9]{3}/i.test(cleaned)) {
    return "No description - click AI Summary";
  }
  return cleaned;
};