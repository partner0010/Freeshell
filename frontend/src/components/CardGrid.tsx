type CardGridProps = {
  children: React.ReactNode;
};

export default function CardGrid({ children }: CardGridProps) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>;
}
