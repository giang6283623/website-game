import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { postLogin } from "../../api/endpoints.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { Checkbox } from "../../components/Checkbox/Checkbox.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { FormCard } from "../../components/FormCard/FormCard.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { AUTH_COPY } from "../../content/account.ts";
import { useForm } from "../../hooks/useForm.ts";
import { loginSchema } from "../../lib/forms.ts";
import { safeNext } from "../../lib/query.ts";
import "./Auth.css";

/** Đăng nhập (E2-S2). Sai thì chỉ báo chung, không nói sai ô nào. Sai nhiều lần (429) thì hiện trạng thái tạm khóa. */
export function Login() {
  const copy = AUTH_COPY.login;
  const auth = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("tiep"));
  const form = useForm({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [locked, setLocked] = useState(false);

  // Đã đăng nhập (vừa xong hoặc từ trước): đi tới trang đích.
  useEffect(() => {
    if (auth.status === "user") navigate(next, { replace: true });
  }, [auth.status, navigate, next]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setWrong(false);
    void form.submit(
      loginSchema,
      async (values) => {
        const account = await postLogin({ ...values, remember });
        auth.setAccount(account);
      },
      (error) => {
        if (error.code === "rate_limited") {
          setLocked(true);
          return true;
        }
        if (error.status === 401) {
          setWrong(true);
          form.setValue("password", "");
          return true;
        }
        return false;
      },
    );
  }

  return (
    <AuthLayout overline={copy.overline} heading={copy.heading} lead={copy.lead}>
      {locked ? (
        <FormCard title={copy.lockedPageTitle}>
          <Notice tone="error" label={copy.lockedLabel}>
            {copy.lockedText}
          </Notice>
          <Button to="/quen-mat-khau" size="l" fill>
            {copy.lockedAction}
          </Button>
        </FormCard>
      ) : (
        <FormCard title={copy.title}>
          <form className="auth-fields" noValidate ref={form.formRef} onSubmit={onSubmit}>
            {wrong ? (
              <Notice tone="error" label={copy.wrongTitle}>
                {copy.wrongText}
              </Notice>
            ) : null}
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
              {...form.field("password")}
              fill
              revealable
              label={copy.password}
              autoComplete="current-password"
              hint={copy.passwordHint}
              error={form.errors.password ?? (wrong ? copy.passwordHint : undefined)}
            />
            <div className="auth-row">
              <Checkbox
                label={copy.remember}
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <Button to="/quen-mat-khau" variant="ghost" size="m">
                {copy.forgot}
              </Button>
            </div>
            <Button type="submit" size="l" fill disabled={form.busy}>
              {form.busy ? copy.submitting : copy.submit}
            </Button>
            <div className="auth-switch">
              <p className="auth-switch__text text-body-m">{copy.noAccount}</p>
              <Button to="/dang-ky" variant="ghost" size="m">
                {copy.register}
              </Button>
            </div>
          </form>
        </FormCard>
      )}
    </AuthLayout>
  );
}
