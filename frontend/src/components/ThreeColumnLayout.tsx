type ThreeColumnLayoutProps = {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
};

export default function ThreeColumnLayout({
  left,
  center,
  right,
}: ThreeColumnLayoutProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,2fr,1fr]">
      <div>{left}</div>
      <div>{center}</div>
      <div>{right}</div>
    </div>
  );
}
