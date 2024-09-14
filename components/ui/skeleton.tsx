import { cn } from "@/lib/utils";

const Skeleton = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  return (
    <div
      className={cn("bg-neutral-800 animate-pulse rounded-md", className)}
      style={style}
    ></div>
  );
};

export default Skeleton;
