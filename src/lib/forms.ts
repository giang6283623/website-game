// Lược đồ kiểm tra biểu mẫu (Zod) và hàm đọc lỗi. Chữ lỗi lấy từ src/content/account.ts (CONTENT-COPY.md mục 6).
// Máy chủ vẫn kiểm lại mọi giá trị. Kiểm ở trình duyệt chỉ để báo lỗi sớm.
import { z } from "zod";
import { FORM_MESSAGES as M } from "../content/account.ts";

const email = z.string().trim().min(1, M.emailEmpty).pipe(z.email(M.emailInvalid));

/** Mật khẩu mới: tối thiểu 8 ký tự, tối đa 128 để không gửi chuỗi quá dài. */
const newPassword = z.string().min(8, M.passwordShort).max(128, M.passwordShort);

const displayName = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (!/^[A-Za-z0-9]*$/.test(value)) ctx.addIssue({ code: "custom", message: M.nameAccent });
    else if (value.length < 3 || value.length > 16) {
      ctx.addIssue({ code: "custom", message: M.nameLength });
    }
  });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, M.passwordEmpty),
});

export const registerSchema = z
  .object({
    email,
    displayName,
    password: newPassword,
    passwordConfirm: z.string(),
  })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: M.passwordMismatch,
  });

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({ password: newPassword, passwordConfirm: z.string() })
  .refine((value) => value.password === value.passwordConfirm, {
    path: ["passwordConfirm"],
    message: M.passwordMismatch,
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, M.currentPasswordEmpty),
    newPassword,
    newPasswordConfirm: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword.length >= 8 && value.newPassword === value.currentPassword) {
      ctx.addIssue({ code: "custom", path: ["newPassword"], message: M.newPasswordSame });
    }
    if (value.newPassword !== value.newPasswordConfirm) {
      ctx.addIssue({ code: "custom", path: ["newPasswordConfirm"], message: M.passwordMismatch });
    }
  });

/** Lấy lỗi đầu tiên của từng ô. Khóa là tên ô. */
export function firstErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !(key in result)) result[key] = issue.message;
  }
  return result;
}
