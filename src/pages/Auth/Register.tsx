import { type FormEvent, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { postRegister } from "../../api/endpoints.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { FormCard } from "../../components/FormCard/FormCard.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { AUTH_COPY } from "../../content/account.ts";
import { useForm } from "../../hooks/useForm.ts";
import { registerSchema } from "../../lib/forms.ts";
import "./Auth.css";

/** Đăng ký (E2-S1). Lỗi từng ô lấy từ kiểm tra ở trình duyệt và từ `fields` của máy chủ (409, 422). */
export function Register() {
  const copy = AUTH_COPY.register;
  const auth = useAuth();
  const navigate = useNavigate();
  const form = useForm({ email: "", displayName: "", password: "", passwordConfirm: "" });
  const [done, setDone] = useState(false);
  const justRegistered = useRef(false);

  // Đã đăng nhập từ trước thì không cần đăng ký: về hồ sơ. Vừa đăng ký xong thì ở lại để hiện thông báo.
  useEffect(() => {
    if (auth.status === "user" && !justRegistered.current) navigate("/ho-so", { replace: true });
  }, [auth.status, navigate]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void form.submit(registerSchema, async (values) => {
      justRegistered.current = true;
      try {
        const account = await postRegister(values);
        auth.setAccount(account);
        setDone(true);
      } catch (error) {
        justRegistered.current = false;
        throw error;
      }
    });
  }

  return (
    <AuthLayout overline={copy.overline} heading={copy.heading} lead={copy.lead}>
      {done ? (
        <FormCard title={copy.title}>
          <Notice tone="success" label={copy.successLabel}>
            {copy.success}
          </Notice>
          <Button to="/tai-game" size="l" fill>
            {copy.successDownload}
          </Button>
          <Button to="/ho-so" variant="secondary" size="l" fill>
            {copy.successProfile}
          </Button>
        </FormCard>
      ) : (
        <FormCard title={copy.title}>
          <form className="auth-fields" noValidate ref={form.formRef} onSubmit={onSubmit}>
            {form.formError ? <Notice tone="error" label={form.formError} /> : null}
            <Field
              {...form.field("email")}
              fill
              label={copy.email}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder={copy.emailPlaceholder}
              hint={copy.emailHint}
            />
            <Field
              {...form.field("displayName")}
              fill
              label={copy.displayName}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              placeholder={copy.displayNamePlaceholder}
              hint={copy.displayNameHint}
            />
            <Field
              {...form.field("password")}
              fill
              revealable
              label={copy.password}
              autoComplete="new-password"
              hint={copy.passwordHint}
            />
            <Field
              {...form.field("passwordConfirm")}
              fill
              revealable
              label={copy.passwordConfirm}
              autoComplete="new-password"
              hint={copy.passwordConfirmHint}
            />
            <Button type="submit" size="l" fill disabled={form.busy}>
              {form.busy ? copy.submitting : copy.submit}
            </Button>
            <p className="auth-note text-body-s">
              {copy.termsBefore}
              <Link to="/quy-tac">{copy.termsLink}</Link>
              {copy.termsAfter}
            </p>
            <div className="auth-switch">
              <p className="auth-switch__text text-body-m">{copy.haveAccount}</p>
              <Button to="/dang-nhap" variant="ghost" size="m">
                {copy.login}
              </Button>
            </div>
          </form>
        </FormCard>
      )}
    </AuthLayout>
  );
}
