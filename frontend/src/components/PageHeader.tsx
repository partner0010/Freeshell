type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">{title}</h2>
          {subtitle ? <p className="text-sm text-neutral-600">{subtitle}</p> : null}
        </div>
        {actions ? <div>{actions}</div> : null}
      </div>
    </div>
  );
}
