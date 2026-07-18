type LoadingProps = {
  fullScreen?: boolean;
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: "h-6 w-6 border-[3px]",
  md: "h-10 w-10 border-4",
  lg: "h-14 w-14 border-[5px]",
};

export function Loading({
  fullScreen = true,
  label = "Loading",
  className = "",
  size = "md",
}: LoadingProps) {
  return <div role="status" aria-live="polite" className={`flex items-center justify-center bg-[#f8f9ff] ${fullScreen ? "min-h-screen w-full" : "h-full w-full"} ${className}`}><span className={`animate-spin rounded-full border-[#dfdcff] border-t-[#4b41e1] ${sizes[size]}`}/><span className="sr-only">{label}</span></div>;
}
