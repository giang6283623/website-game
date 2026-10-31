import { type FormEvent, useEffect, useId, useRef, useState } from "react";
import {
  type BannerDraft,
  createAdminBanner,
  getAdminBanners,
  patchAdminBanner,
} from "../../api/admin-endpoints.ts";
import { normalizeError } from "../../api/client.ts";
import type { AdminBanner } from "../../api/schemas.ts";
import { Button } from "../../components/Button/Button.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { Toggle } from "../../components/Toggle/Toggle.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { useResource } from "../../hooks/useResource.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateFull } from "../../lib/format.ts";
import { Callout, PageHead, rowAction } from "./parts.tsx";
import "./Banners.css";

const copy = ADMIN_COPY.banners;
const MAX_MESSAGE = 120;

type FormValues = {
  message: string;
  linkUrl: string;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
};
type FormErrors = Partial<Record<"message" | "linkUrl" | "startsAt" | "endsAt", string>>;

/** "2026-10-28" thành "28/10/2026". */
function isoToText(iso: string): string {
  const [year = "", month = "", day = ""] = iso.split("-");
  return year && month && day ? `${day}/${month}/${year}` : "";
}

/** "28/10/2026" thành "2026-10-28". Ngày không có thật (31/02) trả null. */
function textToIso(text: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const [, day = "", month = "", year = ""] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  const valid =
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day);
  return valid ? `${year}-${month}-${day}` : null;
}

const toForm = (banner: AdminBanner): FormValues => ({
  message: banner.message,
  linkUrl: banner.linkUrl ?? "",
  startsAt: isoToText(banner.startsAt),
  endsAt: isoToText(banner.endsAt),
  enabled: banner.enabled,
});

const EMPTY_FORM: FormValues = {
  message: "",
  linkUrl: "",
  startsAt: "",
  endsAt: "",
  enabled: false,
};

function validate(values: FormValues): { errors: FormErrors; draft: BannerDraft | null } {
  const errors: FormErrors = {};
  const message = values.message.trim();
  if (!message) errors.message = copy.messages.messageEmpty;
  else if (message.length > MAX_MESSAGE) errors.message = copy.messages.messageTooLong;
  const link = values.linkUrl.trim();
  if (link && (!link.startsWith("/") || link.startsWith("//")))
    errors.linkUrl = copy.messages.linkInvalid;
  const startsAt = textToIso(values.startsAt);
  const endsAt = textToIso(values.endsAt);
  if (!startsAt) errors.startsAt = copy.messages.dateInvalid;
  if (!endsAt) errors.endsAt = copy.messages.dateInvalid;
  if (startsAt && endsAt && endsAt < startsAt) errors.endsAt = copy.messages.endBeforeStart;
  if (Object.keys(errors).length > 0 || !startsAt || !endsAt) return { errors, draft: null };
  return {
    errors,
    draft: { message, linkUrl: link || null, startsAt, endsAt, enabled: values.enabled },
  };
}

/** Quản trị banner (E4-S7): danh sách, công tắc, xem trước và khung sửa. Bật một banner thì máy chủ tắt banner đang hiện. */
export function BannersPage() {
  const resource = useResource("admin/banners", (signal) => getAdminBanners({ signal }), [], {
    isEmpty: (data) => data.banners.length === 0,
  });
  const banners = resource.status === "success" ? resource.data.banners : null;

  // selected: số là id đang sửa, "new" là đang thêm, null là chưa chọn gì.
  const [selected, setSelected] = useState<number | "new" | null>(null);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; label: string } | null>(null);
  const [pendingToggle, setPendingToggle] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleId = useId();

  // Lần đầu có danh sách: chọn banner đang hiện, nếu không có thì banner đầu tiên.
  useEffect(() => {
    if (selected !== null || !banners || banners.length === 0) return;
    const first = banners.find((banner) => banner.status === "showing") ?? banners[0];
    if (first) {
      setSelected(first.id);
      setValues(toForm(first));
    }
  }, [banners, selected]);

  const choose = (banner: AdminBanner) => {
    setSelected(banner.id);
    setValues(toForm(banner));
    setErrors({});
    setNotice(null);
    formRef.current?.scrollIntoView?.({ block: "nearest" });
  };

  const startNew = () => {
    setSelected("new");
    setValues(EMPTY_FORM);
    setErrors({});
    setNotice(null);
    formRef.current?.scrollIntoView?.({ block: "nearest" });
  };

  const cancel = () => {
    const current =
      typeof selected === "number" ? banners?.find((banner) => banner.id === selected) : null;
    const fallback = current ?? banners?.[0];
    setErrors({});
    if (fallback) {
      setSelected(fallback.id);
      setValues(toForm(fallback));
    } else {
      setSelected(null);
      setValues(EMPTY_FORM);
    }
  };

  const toggle = async (banner: AdminBanner, enabled: boolean) => {
    if (pendingToggle !== null) return;
    setPendingToggle(banner.id);
    setNotice(null);
    try {
      await patchAdminBanner(banner.id, { enabled });
      if (selected === banner.id) setValues((previous) => ({ ...previous, enabled }));
      resource.reload();
    } catch (failure) {
      void normalizeError(failure);
      setNotice({ tone: "error", label: ADMIN_COPY.common.actionFailed });
    } finally {
      setPendingToggle(null);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const { errors: found, draft } = validate(values);
    setErrors(found);
    setNotice(null);
    if (!draft) {
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    setBusy(true);
    try {
      const saved =
        typeof selected === "number"
          ? await patchAdminBanner(selected, draft)
          : await createAdminBanner(draft);
      setSelected(saved.id);
      setValues(toForm(saved));
      setNotice({ tone: "success", label: copy.saved });
      resource.reload();
    } catch (failure) {
      const known = normalizeError(failure);
      if (known.status === 422 && Object.keys(known.fields).length > 0) {
        setErrors({
          message: known.fields.message,
          linkUrl: known.fields.linkUrl,
          startsAt: known.fields.startsAt,
          endsAt: known.fields.endsAt,
        });
      } else {
        setNotice({ tone: "error", label: ADMIN_COPY.common.actionFailed });
      }
    } finally {
      setBusy(false);
    }
  };

  const set = (name: keyof FormValues) => (value: string | boolean) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    if (name !== "enabled") setErrors((previous) => ({ ...previous, [name]: undefined }));
  };

  const previewMessage = values.message.trim();
  const previewText = previewMessage
    ? values.linkUrl.trim()
      ? `${previewMessage}. ${copy.previewMore}`
      : previewMessage
    : "";

  return (
    <div className="admin-page">
      <PageHead
        title={copy.title}
        action={
          <Button size="m" onClick={startNew}>
            {copy.create}
          </Button>
        }
      />
      <Callout title={copy.whatTitle}>{copy.whatText}</Callout>
      <div className="banners">
        <div className="banners__list">
          <section className="banners__preview" aria-label={copy.previewLabel}>
            <p className="banners__preview-label text-label-m">{copy.previewLabel}</p>
            <p className="banners__strip text-label-m" data-testid="banner-preview">
              {previewText}
            </p>
          </section>
          <ResourceView resource={resource} copy={ADMIN_LIST_COPY.banners} onEmptyAction={startNew}>
            {(data) => (
              <table className="admin-table banners-table">
                <caption className="visually-hidden">{copy.tableCaption}</caption>
                <thead>
                  <tr className="text-label-m">
                    <th scope="col">{copy.columns.message}</th>
                    <th scope="col">{copy.columns.status}</th>
                    <th scope="col">{copy.columns.toggle}</th>
                    <th scope="col">
                      <span className="visually-hidden">{ADMIN_COPY.navAria}</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.banners.map((banner) => (
                    <tr
                      key={banner.id}
                      className={cn("banners-row", selected === banner.id && "is-selected")}
                    >
                      <td className="banners-row__message">
                        <p className="banners-row__title text-body-m-strong">{banner.message}</p>
                        <p className="banners-row__range text-body-s">
                          {copy.range(
                            formatDateFull(banner.startsAt),
                            formatDateFull(banner.endsAt),
                          )}
                        </p>
                      </td>
                      <td className="banners-row__status">
                        <p
                          className={cn(
                            "admin-state",
                            "text-label-m",
                            banner.status === "showing" && "admin-state--ok",
                          )}
                        >
                          {copy.status[banner.status]}
                        </p>
                      </td>
                      <td className="banners-row__toggle">
                        <Toggle
                          label={banner.enabled ? copy.on : copy.off}
                          checked={banner.enabled}
                          disabled={pendingToggle !== null}
                          onChange={(next) => toggle(banner, next)}
                        />
                      </td>
                      <td className="banners-row__edit">
                        <button type="button" className={rowAction} onClick={() => choose(banner)}>
                          {copy.edit}
                          <span className="visually-hidden">: {banner.message}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </ResourceView>
        </div>
        <form
          ref={formRef}
          className="banner-form"
          noValidate
          aria-labelledby={titleId}
          onSubmit={submit}
        >
          <h2 id={titleId} className="banner-form__title text-heading-h3">
            {selected === "new" ? copy.formTitleNew : copy.formTitle}
          </h2>
          {notice ? <Notice tone={notice.tone} label={notice.label} /> : null}
          <AreaField
            label={copy.messageLabel}
            hint={copy.messageHint}
            error={errors.message}
            value={values.message}
            onChange={(next) => set("message")(next)}
          />
          <Field
            fill
            name="linkUrl"
            label={copy.linkLabel}
            hint={copy.linkHint}
            error={errors.linkUrl}
            value={values.linkUrl}
            placeholder="/tin-tuc"
            onChange={(event) => set("linkUrl")(event.target.value)}
            autoComplete="off"
          />
          <Field
            fill
            name="startsAt"
            label={copy.fromLabel}
            hint={copy.fromHint}
            error={errors.startsAt}
            value={values.startsAt}
            inputMode="numeric"
            placeholder="28/10/2026"
            onChange={(event) => set("startsAt")(event.target.value)}
            autoComplete="off"
          />
          <Field
            fill
            name="endsAt"
            label={copy.toLabel}
            hint={copy.toHint}
            error={errors.endsAt}
            value={values.endsAt}
            inputMode="numeric"
            placeholder="30/10/2026"
            onChange={(event) => set("endsAt")(event.target.value)}
            autoComplete="off"
          />
          <Toggle
            label={values.enabled ? copy.on : copy.off}
            checked={values.enabled}
            onChange={(next) => set("enabled")(next)}
          />
          <div className="banner-form__actions">
            <Button type="submit" size="l" fill disabled={busy}>
              {copy.save}
            </Button>
            <Button variant="secondary" size="l" fill onClick={cancel}>
              {copy.cancel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Ô nhiều dòng dùng lại dáng của Field. */
function AreaField({
  label,
  hint,
  error,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  error?: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const message = error ?? hint;
  return (
    <div className={cn("field", "field--fill", error && "field--error")}>
      <label className="field__label text-label-m" htmlFor={id}>
        {label}
      </label>
      <div className="field__box banner-form__area">
        <textarea
          id={id}
          name="message"
          className="field__input banner-form__textarea text-body-m"
          rows={2}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <p id={hintId} className="field__hint text-body-s">
        {message}
      </p>
    </div>
  );
}
