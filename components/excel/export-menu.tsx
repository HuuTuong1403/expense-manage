import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui-m3/icon";

export function ExportMenu({
  exportHref,
  templateHref,
}: {
  exportHref: string;
  templateHref: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Button variant="subtle" size="md" render={<a href={exportHref} />}>
        <Icon name="file_download" size={18} />
        Xuất Excel
      </Button>
      <Button
        variant="ghost"
        size="md"
        render={<a href={templateHref} />}
      >
        <Icon name="description" size={18} />
        Mẫu
      </Button>
    </div>
  );
}
