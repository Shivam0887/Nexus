import { cn } from "@/lib/utils";
import Link from "next/link";

type AnimatedModalProps = {
  children: React.ReactNode;
  icon: React.ReactNode;
  href: string;
  className?: string;
};

const AnimatedModal = ({
  children,
  icon: Icon,
  href,
  className,
}: AnimatedModalProps) => {
  return (
    <div className={cn("animate-modal", className)}>
      <Link href={href} className="modal_icon">
        <span>{Icon}</span>
      </Link>
      <div className="modal_text">{children}</div>
    </div>
  );
};

export default AnimatedModal;
