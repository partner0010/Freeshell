type TextVariant = "heading" | "subheading" | "body" | "caption" | "code";
type TextTone = "default" | "muted" | "subtle" | "primary";
type TextWeight = "regular" | "medium" | "semibold" | "bold";

type TextProps = {
  as?: keyof JSX.IntrinsicElements;
  variant?: TextVariant;
  tone?: TextTone;
  weight?: TextWeight;
  children: React.ReactNode;
  className?: string;
};

const variantClasses: Record<TextVariant, string> = {
  heading: "text-2xl",
  subheading: "text-lg",
  body: "text-sm",
  caption: "text-xs",
  code: "font-code text-xs",
};

const toneClasses: Record<TextTone, string> = {
  default: "text-neutral-900 dark:text-neutral-100",
  muted: "text-neutral-600 dark:text-neutral-300",
  subtle: "text-neutral-500 dark:text-neutral-400",
  primary: "text-primary-700 dark:text-primary-300",
};

const weightClasses: Record<TextWeight, string> = {
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

export default function Text({
  as: Component = "p",
  variant = "body",
  tone = "muted",
  weight = "regular",
  children,
  className,
}: TextProps) {
  return (
    <Component
      className={`${variantClasses[variant]} ${toneClasses[tone]} ${weightClasses[weight]} ${className ?? ""}`}
    >
      {children}
    </Component>
  );
}
