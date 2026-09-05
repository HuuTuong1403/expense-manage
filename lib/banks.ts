/** Danh sách ngân hàng — không phụ thuộc `qrcode`, dùng được ở client. */

export const VN_BANKS = [
  { bin: "970436", shortName: "VCB", name: "Vietcombank" },
  { bin: "970415", shortName: "CTG", name: "VietinBank" },
  { bin: "970418", shortName: "BIDV", name: "BIDV" },
  { bin: "970405", shortName: "AGR", name: "Agribank" },
  { bin: "970422", shortName: "MB", name: "MB Bank" },
  { bin: "970407", shortName: "TCB", name: "Techcombank" },
  { bin: "970416", shortName: "ACB", name: "ACB" },
  { bin: "970432", shortName: "VPB", name: "VPBank" },
  { bin: "970423", shortName: "TPB", name: "TPBank" },
  { bin: "970403", shortName: "STB", name: "Sacombank" },
  { bin: "970441", shortName: "VIB", name: "VIB" },
  { bin: "970443", shortName: "SHB", name: "SHB" },
  { bin: "970448", shortName: "OCB", name: "OCB" },
  { bin: "970454", shortName: "VCCB", name: "VietCapitalBank" },
  { bin: "970429", shortName: "SCB", name: "SCB" },
  { bin: "970437", shortName: "HDB", name: "HDBank" },
  { bin: "970426", shortName: "MSB", name: "MSB" },
  { bin: "970431", shortName: "EIB", name: "Eximbank" },
  { bin: "970414", shortName: "OJB", name: "OceanBank" },
  { bin: "970409", shortName: "GPB", name: "GPBank" },
] as const;

export function bankLabel(bin?: string | null, shortName?: string | null) {
  const found = VN_BANKS.find((bank) => bank.bin === bin);
  return found?.name ?? shortName ?? bin ?? "Chưa có ngân hàng";
}

export function fallbackVietQrUrl(input: {
  bankBin: string;
  accountNumber: string;
  amount: number;
  note: string;
}) {
  const bank = VN_BANKS.find((item) => item.bin === input.bankBin);
  const slug = (bank?.shortName ?? input.bankBin).toLowerCase();
  const note = encodeURIComponent(input.note);
  return `https://img.vietqr.io/image/${slug}-${input.accountNumber}-compact2.png?amount=${Math.round(input.amount)}&addInfo=${note}`;
}
