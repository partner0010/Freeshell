import Avatar from "./Avatar";

type AvatarItem = {
  name: string;
  src?: string;
};

type AvatarGroupProps = {
  items: AvatarItem[];
  maxVisible?: number;
};

export default function AvatarGroup({ items, maxVisible = 3 }: AvatarGroupProps) {
  const visible = items.slice(0, maxVisible);
  const extra = Math.max(0, items.length - visible.length);

  return (
    <div className="flex items-center">
      {visible.map((item, index) => (
        <div key={`${item.name}-${index}`} className="-ml-2 first:ml-0">
          <Avatar name={item.name} src={item.src} size="sm" />
        </div>
      ))}
      {extra > 0 ? (
        <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-xs text-neutral-600">
          +{extra}
        </div>
      ) : null}
    </div>
  );
}
