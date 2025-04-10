export default function Title({ text, className }: { text: string, className?: string }) {
  return (
    <h1 className={`mt-8 mb-8 font-black text-3xl md:text-4xl drop-shadow-xl drop-shadow-neutral-300/50 dark:drop-shadow-neutral-700/50 ${className ?? ""}`}>
      {text}
    </h1>
  );
}
