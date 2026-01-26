type CardProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
};

export default function Card({
  title,
  description,
  children,
  actions,
  footer,
}: CardProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          {description ? (
            <p className="text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
      {footer ? (
        <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-700">
          {footer}
        </div>
      ) : null}
    </section>
  );
}
