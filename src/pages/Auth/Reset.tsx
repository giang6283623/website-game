import { type FormEvent, type ReactNode, useState } from "react";
import { useSearchParams } from "react-router";
import { getResetCheck, postReset } from "../../api/endpoints.ts";
import { AuthLayout } from "../../components/AuthLayout/AuthLayout.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { FormCard } from "../../components/FormCard/FormCard.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { AUTH_COPY, FORM_MESSAGES } from "../../content/account.ts";
import { useForm } from "../../hooks/useForm.ts";
import { useResource } from "../../hooks/useResource.ts";
import { resetSchema } from "../../lib/forms.ts";
import "./Auth.css";

/** Đặt lại mật khẩu (E2-S3). Mã nằm ở `?ma=`. Kiểm mã trước khi hiện form. Mã hỏng hoặc đã dùng thì hiện trạng thái hết hạn. */
export function Reset() {
  const copy = AUTH_COPY.reset;
  const [params] = useSearchParams();
  const token = params.get("ma") ?? "";
  const check = useResource("auth/reset", (signal) => getResetCheck(token, { signal }), [token], {
    enabled: token !== "",
  });
  const form = useForm({ password: "", passwordConfirm: "" });
  const [state, setState] = useState<"form" | "dead" | "done">("form");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void form.submit(
      resetSchema,
      async (values) => {
        await postReset({ token, ...values });
        setState("done");
      },
      (error) => {
        if (error.status === 410 || error.status === 404) {
          setState("dead");
          return true;
        }
        return false;
      },
    );
  }

  const dead =
    token === "" ||
    state === "dead" ||
    (check.status === "error" && (check.error.status === 410 || check.error.status === 404));

  let card: ReactNode;
  if (state === "done") {
    card = (
      <FormCard largeTitle title={copy.doneTitle}>
        <Notice tone="success" label={copy.doneLabel}>
          {copy.doneText}
        </Notice>
        <Button to="/dang-nhap" size="l" fill>
          {copy.doneAction}
        </Button>
      </FormCard>
    );
  } else if (dead) {
    card = (
      <FormCard largeTitle title={copy.deadTitle}>
        <Notice tone="error" label={copy.deadLabel}>
          {copy.deadText}
        </Notice>
        <Button to="/quen-mat-khau" size="l" fill>
          {copy.deadAction}
        </Button>
      </FormCard>
    );
  } else if (check.status === "error") {
    card = (
      <FormCard largeTitle title={copy.title}>
        <Notice tone="error" label={FORM_MESSAGES.network} />
        <Button size="l" fill onClick={check.reload}>
          {copy.retry}
        </Button>
      </FormCard>
    );
  } else if (check.status === "loading") {
    card = (
      <FormCard largeTitle title={copy.title}>
        <p className="auth-intro" role="status" aria-busy="true">
          {copy.checking}
        </p>
      </FormCard>
    );
  } else {
    card = (
      <FormCard largeTitle title={copy.title}>
        <form className="auth-fields" noValidate ref={form.formRef} onSubmit={onSubmit}>
          <p className="auth-intro">{copy.intro(check.data.emailMasked)}</p>
          {form.formError ? <Notice tone="error" label={form.formError} /> : null}
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
        </form>
      </FormCard>
    );
  }

  return (
    <AuthLayout overline={copy.overline} heading={copy.heading} lead={copy.lead} bar="login">
      {card}
    </AuthLayout>
  );
}
