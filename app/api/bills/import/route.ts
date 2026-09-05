import { revalidateExpenseViews } from "@/lib/revalidate";
import {
  commitBillImport,
  previewBillImport,
} from "@/lib/excel/import-bills";

async function readFile(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    throw new Error("Chưa chọn file Excel");
  }
  return file.arrayBuffer();
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const dryRun = url.searchParams.get("dryRun") !== "0";
    const buffer = await readFile(request);

    if (dryRun) {
      const preview = await previewBillImport(buffer);
      return Response.json(preview);
    }

    const result = await commitBillImport(buffer, { skipErrors: true });
    revalidateExpenseViews();
    return Response.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không đọc được file";
    return Response.json({ message }, { status: 400 });
  }
}
