import type { IconName } from "@/lib/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: IconName;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

/** Ba nhóm điều hướng đúng thứ tự trong mockup. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Tổng quan",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/reports", label: "Báo cáo", icon: "bar_chart" },
    ],
  },
  {
    label: "Dữ liệu",
    items: [
      { href: "/bills", label: "Hóa đơn", icon: "receipt_long" },
      { href: "/categories", label: "Danh mục", icon: "category" },
      { href: "/users", label: "Thành viên", icon: "group" },
    ],
  },
  {
    label: "Thanh toán",
    items: [
      { href: "/balance", label: "Đối soát công nợ", icon: "balance" },
      { href: "/budget", label: "Ngân sách", icon: "account_balance_wallet" },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = {
  href: "/settings",
  label: "Cài đặt",
  icon: "settings",
};

/** Bốn mục dùng nhiều nhất, hiện ở bottom nav trên điện thoại. */
export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Tổng quan", icon: "dashboard" },
  { href: "/bills", label: "Hóa đơn", icon: "receipt_long" },
  { href: "/balance", label: "Đối soát", icon: "balance" },
  { href: "/categories", label: "Danh mục", icon: "category" },
];

/** Tra nhóm cha và mục hiện tại để dựng breadcrumb theo route. */
export function findNavLocation(pathname: string) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find(
      (candidate) =>
        pathname === candidate.href || pathname.startsWith(`${candidate.href}/`),
    );
    if (item) return { group: group.label, item };
  }

  if (pathname.startsWith(SETTINGS_ITEM.href)) {
    return { group: "Hệ thống", item: SETTINGS_ITEM };
  }

  return null;
}
