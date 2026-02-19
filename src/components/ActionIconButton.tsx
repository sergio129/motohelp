import { ActionIcons, ActionButtonStyles } from "@/lib/utils";

type ActionType = keyof typeof ActionIcons;
type StyleType = keyof typeof ActionButtonStyles;

interface ActionIconButtonProps {
  icon: ActionType;
  onClick: () => void;
  title?: string;
  style?: StyleType;
  disabled?: boolean;
  className?: string;
}

export function ActionIconButton({
  icon,
  onClick,
  title,
  style = "DEFAULT",
  disabled = false,
  className = "",
}: ActionIconButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center w-7 h-7 rounded transition-colors";
  const buttonStyle = ActionButtonStyles[style] || ActionButtonStyles.DEFAULT;

  return (
    <button
      type="button"
      className={`${baseStyle} ${buttonStyle} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {ActionIcons[icon]}
    </button>
  );
}
