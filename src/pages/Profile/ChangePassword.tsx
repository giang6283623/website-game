import { type FormEvent, useState } from "react";
import { postChangePassword } from "../../api/endpoints.ts";
import { Button } from "../../components/Button/Button.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { FormCard } from "../../components/FormCard/FormCard.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { PageTitle } from "../../components/PageTitle/PageTitle.tsx";
import { PASSWORD_COPY, PROFILE_COPY } from "../../content/account.ts";
import { useForm } from "../../hooks/useForm.ts";
import { changePasswordSchema } from "../../lib/forms.ts";
import "../Auth/Auth.css";
import "./ChangePassword.css";

/** Đổi mật khẩu (E2-S5). Mật khẩu hiện tại sai thì lỗi nằm ở ô đầu. Đổi xong, xóa ba ô và báo thành công. */
export function ChangePassword() {
  const copy = PASSWORD_COPY;
  const form = useForm({ currentPassword: "", newPassword: "", newPasswordConfirm: "" });
  const [saved, setSaved] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaved(false);
    void form.submit(changePasswordSchema, async (values) => {
      await postChangePassword(values);
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("newPasswordConfirm", "");
      setSaved(true);
    });
  }

  return (
    <>
      <PageTitle
        crumbs={[
          { label: "Trang chủ", to: "/", desktopOnly: true },
          { label: PROFILE_COPY.title, to: "/ho-so" },
          { label: copy.title },
        ]}
        title={copy.title}
        lead={copy.lead}
        compactOnMobile
      />
      <div className="password container">
        <FormCard className="password__form">
          <form className="auth-fields" noValidate ref={form.formRef} onSubmit={onSubmit}>
            {saved ? (
              <Notice tone="success" label={copy.doneLabel}>
                {copy.doneText}
              </Notice>
            ) : null}
            {form.formError ? <Notice tone="error" label={form.formError} /> : null}
            <Field
              {...form.field("currentPassword")}
              fill
              revealable
              label={copy.current}
              autoComplete="current-password"
              hint={copy.currentHint}
            />
            <Field
              {...form.field("newPassword")}
              fill
              revealable
              label={copy.next}
              autoComplete="new-password"
              hint={copy.nextHint}
            />
            <Field
              {...form.field("newPasswordConfirm")}
              fill
              revealable
              label={copy.confirm}
              autoComplete="new-password"
              hint={copy.confirmHint}
            />
            <div className="password__actions">
              <Button type="submit" size="l" disabled={form.busy}>
                {form.busy ? copy.submitting : copy.submit}
              </Button>
              <Button to="/ho-so" variant="secondary" size="l">
                {copy.cancel}
              </Button>
            </div>
          </form>
        </FormCard>
        <aside className="password__tips" aria-labelledby="password-tips">
          <h2 id="password-tips" className="text-heading-h3">
            {copy.tips.title}
          </h2>
          <ul className="password__tips-list text-body-m">
            {copy.tips.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="password__tips-note text-body-s">{copy.tips.note}</p>
        </aside>
      </div>
    </>
  );
}
