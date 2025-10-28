export default function EventInfoCard({ Icon, title, description }: { Icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="my-2 flex items-center gap-3 p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
      <div className="flex-shrink-0 p-2 bg-neutral-100 dark:bg-neutral-700 rounded-lg">
        <Icon className="size-5 text-neutral-600 dark:text-neutral-300" />
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{title}</h4>
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{description}</p>
      </div>
    </div>
  );
}
