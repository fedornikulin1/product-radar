export default function HighlightedText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  const cleanQuery = query.trim();

  if (!cleanQuery) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = cleanQuery.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + cleanQuery.length);
  const after = text.slice(index + cleanQuery.length);

  return (
    <>
      {before}
      <mark className="rounded-md bg-[#5227FF]/35 px-1 font-black text-white">
        {match}
      </mark>
      {after}
    </>
  );
}
