import "server-only";
import QRCode from "qrcode";

export { VN_BANKS, bankLabel, fallbackVietQrUrl } from "@/lib/banks";

function tlv(id: string, value: string) {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

/** CRC-16/CCITT-FALSE — đúng chuẩn EMVCo QR. */
function crc16(payload: string) {
  let crc = 0xffff;
  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export type VietQrInput = {
  bankBin: string;
  accountNumber: string;
  amount: number;
  note: string;
  accountName?: string | null;
};

/**
 * Payload VietQR động chuẩn Napas 247 (GUID A000000727).
 * Dùng được với mọi app ngân hàng hỗ trợ QR Napas.
 */
export function buildVietQrPayload({
  bankBin,
  accountNumber,
  amount,
  note,
}: VietQrInput) {
  const beneficiary = tlv("00", bankBin) + tlv("01", accountNumber);
  const merchant =
    tlv("00", "A000000727") + tlv("01", beneficiary) + tlv("02", "QRIBFTTA");

  const purpose = note.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 25);

  const body =
    tlv("00", "01") +
    tlv("01", "12") +
    tlv("38", merchant) +
    tlv("53", "704") +
    tlv("54", String(Math.round(amount))) +
    tlv("58", "VN") +
    (purpose ? tlv("62", tlv("08", purpose)) : "");

  const withCrcId = `${body}6304`;
  return withCrcId + crc16(withCrcId);
}

export async function vietQrSvg(input: VietQrInput) {
  const payload = buildVietQrPayload(input);
  const svg = await QRCode.toString(payload, {
    type: "svg",
    margin: 1,
    width: 192,
    errorCorrectionLevel: "M",
  });
  return { payload, svg };
}

