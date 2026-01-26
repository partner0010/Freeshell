type TwoColumnLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

export default function TwoColumnLayout({ left, right }: TwoColumnLayoutProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
