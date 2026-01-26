import Toggle from "./Toggle";

type ThemeToggleProps = {
  isDark: boolean;
  onChange: (value: boolean) => void;
  label?: string;
};

export default function ThemeToggle({
  isDark,
  onChange,
  label = "다크 모드",
}: ThemeToggleProps) {
  return <Toggle label={label} checked={isDark} onChange={onChange} />;
}
