import { cn } from "@/lib/utils";
import { initialOf } from "@/lib/format";

export const AVATAR_TONES = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-soft text-on-tertiary-soft",
  neutral: "bg-surface-highest text-foreground",
  muted: "bg-surface-high text-on-surface-variant",
} as const;

export type AvatarTone = keyof typeof AVATAR_TONES;

const TONE_ORDER: AvatarTone[] = [
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "muted",
];

/**
 * Chọn tông màu tất định từ id để một người luôn cùng màu ở mọi trang,
 * mọi lần load.
 */
export function toneForId(id: number | string): AvatarTone {
  const text = String(id);
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100_000;
  }
  return TONE_ORDER[hash % TONE_ORDER.length]!;
}

const SIZE_CLASSES: Record<number, string> = {
  24: "size-6 text-code",
  32: "size-8 text-body-md",
  36: "size-9 text-headline-sm",
  40: "size-10 text-headline-sm",
  48: "size-12 text-headline-md",
};

type MemberAvatarProps = {
  name: string | null | undefined;
  tone?: AvatarTone;
  /** Dùng khi không truyền `tone`: sinh màu tất định từ id. */
  id?: number | string;
  size?: 24 | 32 | 36 | 40 | 48;
  className?: string;
};

export function MemberAvatar({
  name,
  tone,
  id,
  size = 32,
  className,
}: MemberAvatarProps) {
  const resolvedTone = tone ?? (id !== undefined ? toneForId(id) : "neutral");

  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold shadow-sm",
        SIZE_CLASSES[size],
        AVATAR_TONES[resolvedTone],
        className,
      )}
    >
      {initialOf(name)}
    </span>
  );
}
