import { Logo } from "@/components/logo";

type AuthPageHeaderProps = {
  title: string;
  description?: React.ReactNode;
  className?: string;
};

export function AuthPageHeader({ title, description, className = "mb-8" }: AuthPageHeaderProps) {
  return <header className={`text-center ${className}`}><div className="flex justify-center"><Logo /></div><div className="mt-8"><h1 className="text-3xl font-semibold tracking-[-.02em]">{title}</h1>{description && <div className="mt-2 leading-6 text-[#45464d]">{description}</div>}</div></header>;
}
