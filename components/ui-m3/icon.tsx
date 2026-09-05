import { cn } from "@/lib/utils";
import type { IconName } from "@/lib/icons";

type IconProps = {
  name: IconName;
  /** Cỡ glyph tính bằng px, khớp với các cỡ dùng trong mockup. */
  size?: number;
  filled?: boolean;
  weight?: number;
  className?: string;
};

/**
 * Icon Material Symbols. Kích thước ô được ghim bằng `size` và `overflow-hidden`
 * để lúc font chưa tải xong thì tên icon bị cắt gọn thay vì hiện cả chữ.
 */
export function Icon({
  name,
  size = 20,
  filled = false,
  weight = 400,
  className,
}: IconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "material-symbols-outlined shrink-0 select-none overflow-hidden",
        className,
      )}
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  );
}
