import Image from "next/image";

type AvatarProps = {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};
const sizePixels: Record<NonNullable<AvatarProps["size"]>, number> = {
  sm: 32,
  md: 40,
  lg: 48,
};

export default function Avatar({ name, src, size = "md" }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-full bg-neutral-200 text-neutral-700 ${sizeClasses[size]}`}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={sizePixels[size]}
          height={sizePixels[size]}
          className="h-full w-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
