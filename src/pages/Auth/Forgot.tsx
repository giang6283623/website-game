import { type FormEvent, useState } from "react";
import { postForgot } from "../../api/endpoints.ts";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { FormCard } from "../../components/FormCard/FormCard.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { AUTH_COPY } from "../../content/account.ts";
import { useCountdown } from "../../hooks/useCountdown.ts";
import { useForm } from "../../hooks/useForm.ts";
import { forgotSchema } from "../../lib/forms.ts";
import "./Auth.css";

/** Giờ có thể gửi lại liên kết (giả định A-22: 60 giây). */
export const RESEND_SECONDS = 60;

/** Quên mật khẩu (E2-S3). Luôn báo "đã gửi" dù email có tài khoản hay không, để không lộ email nào có tài khoản. */
export function Forgot() {
  const copy = AUTH_COPY.forgot;
  const form = useForm({ email: "" });
  const [sent, setSent] = useState(false);
  const countdown = useCountdown(RESEND_SECONDS);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void form.submit(forgotSchema, async (values) => {
      await postForgot(values.email.trim());
      countdown.restart();
      setSent(true);
    });
  }

  async function resend() {
    await form.submit(forgotSchema, async (values) => {
      await postForgot(values.email.trim());
      countdown.restart();
    });
  }

  return (
    <AuthLayout overline={copy.overline} heading={copy.heading} lead={copy.lead} bar="login">
      {sent ? (
        <FormCard largeTitle title={copy.sentTitle}>
          <Notice tone="success" label={copy.sentLabel}>
            {copy.sentText}
          </Notice>
          {form.formError ? <Notice tone="error" label={form.formError} /> : null}
          <div className="auth-actions">
            <Button
              variant="secondary"
              size="l"
              fill
              disabled={countdown.remaining > 0 || form.busy}
              onClick={() => void resend()}
            >
              {copy.resend}
            </Button>
            {countdown.remaining > 0 ? (
              <p className="auth-hint text-body-s" aria-live="polite">
                {copy.resendWait(countdown.remaining)}
              </p>
            ) : null}
          </div>
          <Button to="/dang-nhap" variant="ghost" size="m" fill>
            {copy.back}
          </Button>
        </FormCard>
      ) : (
        <FormCard largeTitle title={copy.title}>
          <form className="auth-fields" noValidate ref={form.formRef} onSubmit={onSubmit}>
            <p className="auth-intro">{copy.intro}</p>
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
            <Button type="submit" size="l" fill disabled={form.busy}>
              {form.busy ? copy.submitting : copy.submit}
            </Button>
            <div className="auth-switch">
              <p className="auth-switch__text text-body-m">{copy.remembered}</p>
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
