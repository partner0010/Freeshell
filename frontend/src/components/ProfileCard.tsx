import Avatar from "./Avatar";

type ProfileCardProps = {
  name: string;
  role: string;
  description?: string;
};

export default function ProfileCard({ name, role, description }: ProfileCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-neutral-200 bg-white p-4">
      <Avatar name={name} />
      <div>
        <p className="text-sm font-semibold text-neutral-900">{name}</p>
        <p className="text-sm text-neutral-600">{role}</p>
        {description ? <p className="text-xs text-neutral-500">{description}</p> : null}
      </div>
    </div>
  );
}
