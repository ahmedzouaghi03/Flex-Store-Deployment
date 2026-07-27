import Link from "next/link";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";

type CommonProps = {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: ReactNode;
  fullWidth?: boolean;
  variant?: "primary" | "outline";
};

type ButtonProps = CommonProps & {
  as?: "button";
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

type AnchorProps = CommonProps & {
  as: "a";
  href: string;
  target?: string;
  rel?: string;
};

type LinkProps = CommonProps & {
  as: "link";
  href: string;
};

type PrimaryButtonProps = ButtonProps | AnchorProps | LinkProps;

export default function PrimaryButton(props: PrimaryButtonProps) {
  const {
    children,
    className = "",
    disabled = false,
    loading = false,
    loadingText,
    fullWidth = false,
    variant = "primary",
  } = props;

  const variantClass = variant === "outline" ? "btn-outline" : "btn-primary";
  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass =
    disabled || loading ? "pointer-events-none opacity-60" : "";

  const baseClass =
    `btn ${variantClass} ${widthClass} ${disabledClass} ${className}`.trim();

  const content = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      {loadingText ?? children}
    </>
  ) : (
    children
  );

  if (props.as === "a") {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        aria-disabled={disabled || loading}
        className={baseClass}
      >
        {content}
      </a>
    );
  }

  if (props.as === "link") {
    return (
      <Link
        href={props.href}
        aria-disabled={disabled || loading}
        className={baseClass}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? "button"}
      onClick={props.onClick}
      disabled={disabled || loading}
      className={baseClass}
    >
      {content}
    </button>
  );
}
