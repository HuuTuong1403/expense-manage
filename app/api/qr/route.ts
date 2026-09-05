import { vietQrSvg, fallbackVietQrUrl } from "@/lib/vietqr";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const bankBin = url.searchParams.get("bankBin") ?? "";
  const accountNumber = url.searchParams.get("accountNumber") ?? "";
  const amount = Number(url.searchParams.get("amount") ?? 0);
  const note = url.searchParams.get("note") ?? "";
  const accountName = url.searchParams.get("accountName");
  const download = url.searchParams.get("download") === "1";

  if (!bankBin || !accountNumber || !amount) {
    return Response.json({ message: "Thiếu thông tin tài khoản" }, { status: 400 });
  }

  try {
    const { svg } = await vietQrSvg({
      bankBin,
      accountNumber,
      amount,
      note,
      accountName,
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "no-store",
        ...(download
          ? {
              "Content-Disposition": `attachment; filename="vietqr.svg"`,
            }
          : {}),
      },
    });
  } catch (error) {
    console.error("Không sinh được VietQR:", error);
    return Response.redirect(
      fallbackVietQrUrl({ bankBin, accountNumber, amount, note }),
    );
  }
}
