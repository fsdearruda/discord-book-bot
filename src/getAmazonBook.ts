const amazonTag = <string>process.env.AMAZON_TAG;

export default (isbn: string[] | null): string | null => {
  if (!isbn) return null;
  return `https://amazon.com.br/dp/${isbn[1]}?tag=${amazonTag}`;
};
