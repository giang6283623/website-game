import { type ChangeEvent, useId, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  createAdminItem,
  getAdminItem,
  getAdminItems,
  type ItemDraft,
  patchAdminItem,
  uploadImage,
} from "../../api/admin-endpoints.ts";
import { normalizeError } from "../../api/client.ts";
import { ITEM_GROUP_KEYS, type Item, type ItemGroupKey } from "../../api/schemas.ts";
import { Button } from "../../components/Button/Button.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { ITEM_GROUP_LABEL } from "../../content/labels.ts";
import { useResource } from "../../hooks/useResource.ts";
import { assetUrl } from "../../lib/assets.ts";
import { getNow } from "../../lib/clock.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateTime } from "../../lib/format.ts";
import { PageHead, PanelRow, rowAction, useUnsavedGuard } from "./parts.tsx";
import "./Compose.css";
import "./ItemForm.css";

const PATH = "/quan-tri/vat-pham";
const copy = ADMIN_COPY.items.form;
const text = copy.messages;
const LIMITS = { name: 60, typeLabel: 40, statLine: 80, description: 400, gameId: 40, stats: 6 };
const STAT_TEXT_MAX = 40;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_KEY_PATTERN = /^(?!.*\.\.)[a-z0-9][a-z0-9/_.-]*\.(?:webp|png|jpe?g)$/i;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

type FieldName =
  | "name"
  | "slug"
  | "group"
  | "typeLabel"
  | "stats"
  | "statLine"
  | "description"
  | "imageKey"
  | "gameItemId"
  | "featured";
type Errors = Partial<Record<FieldName, string>>;
/** `suggested`: nhãn do hệ thống điền sẵn, người dùng chưa sửa. Dòng như vậy mà thiếu giá trị thì bị bỏ qua khi lưu. */
type StatRow = { key: number; label: string; value: string; suggested?: boolean };
type NoticeState = { tone: "success" | "error"; label: string };

const length = (value: string) => Array.from(value).length;

/** Nhãn chỉ số gợi ý cho nhóm. Nhóm chưa có gợi ý bắt đầu bằng một dòng trống. */
function suggestedRows(group: ItemGroupKey | null, nextKey: () => number): StatRow[] {
  const labels = (group && copy.statSuggestions[group]) || [""];
  return labels.map((label) => ({ key: nextKey(), label, value: "", suggested: label !== "" }));
}

/** Thêm hoặc sửa vật phẩm (G-23, E4-S6). Có `:id` trên địa chỉ thì tải vật phẩm rồi sửa, không thì thêm mới. */
export function ItemFormPage() {
  const { id } = useParams();
  const editingId = id !== undefined && /^\d{1,9}$/.test(id) ? Number(id) : null;
  const resource = useResource(
    "admin/item",
    (signal) => getAdminItem(editingId ?? 0, { signal }),
    [editingId],
    {
      enabled: editingId !== null,
    },
  );

  if (id !== undefined && editingId === null) return <MissingItem />;
  if (editingId === null) return <ItemForm key="new" item={null} />;
  return (
    <ResourceView
      resource={resource}
      copy={{ ...ADMIN_LIST_COPY.items, errorTitle: copy.loadFailed }}
    >
      {(item) => <ItemForm key={item.id} item={item} />}
    </ResourceView>
  );
}

function MissingItem() {
  return (
    <div className="admin-page">
      <PageHead title={copy.editTitle} />
      <Link className={rowAction} to={PATH}>
        {ADMIN_COPY.items.title}
      </Link>
    </div>
  );
}

function ItemForm({ item }: { item: Item | null }) {
  const navigate = useNavigate();
  const editing = item !== null;
  const keyCounter = useRef(0);
  const nextKey = () => {
    keyCounter.current += 1;
    return keyCounter.current;
  };

  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [group, setGroup] = useState<ItemGroupKey | null>(item?.group ?? "vu-khi");
  const [typeLabel, setTypeLabel] = useState(item?.typeLabel ?? "");
  const [stats, setStats] = useState<StatRow[]>(() =>
    item
      ? item.stats.map((stat) => ({ key: nextKey(), label: stat.label, value: stat.value }))
      : suggestedRows("vu-khi", nextKey),
  );
  const [statLine, setStatLine] = useState(item?.statLine ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [imageKey, setImageKey] = useState(item?.imageKey ?? "");
  const [preview, setPreview] = useState<string | null>(null);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [visible, setVisible] = useState(item?.visible ?? true);
  const [gameItemId, setGameItemId] = useState(item?.gameItemId ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const snapshot = () =>
    JSON.stringify([
      name,
      slug,
      group,
      typeLabel,
      stats.map(({ label, value }) => [label, value]),
      statLine,
      description,
      imageKey,
      featured,
      visible,
      gameItemId,
    ]);
  const [saved, setSaved] = useState(snapshot);
  const dirty = snapshot() !== saved;
  useUnsavedGuard(dirty && !saving, text.leave);

  const ids = {
    name: useId(),
    slug: useId(),
    group: useId(),
    typeLabel: useId(),
    stats: useId(),
    statLine: useId(),
    description: useId(),
    imageKey: useId(),
    gameItemId: useId(),
  };
  const fileRef = useRef<HTMLInputElement>(null);

  // Số vật phẩm nổi bật lấy từ danh sách. Con số hiển thị đã tính cả lựa chọn đang sửa.
  const summary = useResource(
    "admin/items/summary",
    (signal) => getAdminItems({ limit: 1 }, { signal }),
    [],
  );
  const featuredNote =
    summary.status === "success"
      ? copy.featuredNote(
          summary.data.featuredCount + (featured ? 1 : 0) - (item?.featured ? 1 : 0),
          summary.data.featuredMax,
        )
      : null;

  const clear = (field: FieldName) =>
    setErrors((previous) => (previous[field] ? { ...previous, [field]: undefined } : previous));

  const pickGroup = (next: ItemGroupKey) => {
    setGroup(next);
    clear("group");
    // Chưa nhập chỉ số nào thì đổi nhãn gợi ý theo nhóm mới. Đã nhập thì giữ nguyên.
    if (!editing && stats.every((row) => !row.value.trim())) {
      setStats(suggestedRows(next, nextKey));
    }
  };

  const changeStat = (key: number, change: Partial<StatRow>) => {
    setStats((rows) =>
      rows.map((row) => (row.key === key ? { ...row, ...change, suggested: false } : row)),
    );
    clear("stats");
  };

  /** Kiểm trước khi gọi API. Máy chủ kiểm lại mọi giới hạn. Dòng chỉ số không dùng thì bỏ qua. */
  const check = (filled: StatRow[]): Errors => {
    const found: Errors = {};
    const trimmedName = name.trim();
    if (!trimmedName) found.name = text.nameEmpty;
    else if (length(trimmedName) > LIMITS.name) found.name = text.nameTooLong;
    if (!editing) {
      const trimmedSlug = slug.trim();
      if (!trimmedSlug) found.slug = text.slugEmpty;
      else if (!SLUG_PATTERN.test(trimmedSlug)) found.slug = text.slugInvalid;
    }
    if (!group) found.group = text.groupEmpty;
    const trimmedType = typeLabel.trim();
    if (!trimmedType) found.typeLabel = text.typeEmpty;
    else if (length(trimmedType) > LIMITS.typeLabel) found.typeLabel = text.typeTooLong;
    if (
      filled.some(
        (row) =>
          !row.label.trim() ||
          !row.value.trim() ||
          length(row.label.trim()) > STAT_TEXT_MAX ||
          length(row.value.trim()) > STAT_TEXT_MAX,
      )
    ) {
      found.stats = text.statsInvalid;
    }
    if (length(statLine.trim()) > LIMITS.statLine) found.statLine = text.statLineTooLong;
    if (length(description.trim()) > LIMITS.description) {
      found.description = text.descriptionTooLong;
    }
    const trimmedImage = imageKey.trim();
    // Vật phẩm nhập từ client game có thể chưa có hình (xem C-74), nên ô này không bắt buộc.
    if (trimmedImage && !IMAGE_KEY_PATTERN.test(trimmedImage))
      found.imageKey = text.imageKeyInvalid;
    if (length(gameItemId.trim()) > LIMITS.gameId) found.gameItemId = text.gameIdTooLong;
    return found;
  };

  const save = async () => {
    if (saving || uploading) return;
    // Dòng trống cả hai ô, và dòng chỉ còn nhãn gợi ý chưa sửa, đều bị bỏ qua.
    const filled = stats.filter((row) => row.value.trim() || (row.label.trim() && !row.suggested));
    const found = check(filled);
    setErrors(found);
    setNotice(null);
    const order: Exclude<FieldName, "featured">[] = [
      "name",
      "slug",
      "group",
      "typeLabel",
      "stats",
      "statLine",
      "description",
      "imageKey",
      "gameItemId",
    ];
    const first = order.find((field) => found[field]);
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }
    setSaving(true);
    const draft: ItemDraft = {
      name: name.trim(),
      group,
      typeLabel: typeLabel.trim(),
      stats: filled.map((row) => ({ label: row.label.trim(), value: row.value.trim() })),
      statLine: statLine.trim(),
      description: description.trim(),
      imageKey: imageKey.trim(),
      gameItemId: gameItemId.trim(),
      featured,
      visible,
    };
    try {
      if (item) await patchAdminItem(item.id, draft);
      else await createAdminItem({ ...draft, slug: slug.trim() });
      setSaved(snapshot());
      navigate(PATH, {
        state: { flash: editing ? ADMIN_COPY.items.updated : ADMIN_COPY.items.created },
        replace: true,
      });
    } catch (failure) {
      const known = normalizeError(failure);
      const fields = known.fields as Partial<Record<FieldName, string>>;
      if (known.status === 422 && Object.keys(fields).length > 0) {
        setErrors({
          name: fields.name,
          slug: fields.slug,
          group: fields.group,
          typeLabel: fields.typeLabel,
          stats: fields.stats,
          statLine: fields.statLine,
          description: fields.description,
          imageKey: fields.imageKey,
          gameItemId: fields.gameItemId,
          featured: fields.featured,
        });
      } else {
        setNotice({ tone: "error", label: text.saveFailed });
      }
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (file: File | null | undefined) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_MAX_BYTES) {
      setErrors((previous) => ({ ...previous, imageKey: text.imageUpload }));
      return;
    }
    clear("imageKey");
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setImageKey(result.imageKey);
      setPreview(
        typeof URL.createObjectURL === "function"
          ? URL.createObjectURL(file)
          : assetUrl(result.imageKey),
      );
    } catch (failure) {
      const known = normalizeError(failure);
      setErrors((previous) => ({
        ...previous,
        imageKey: known.status === 422 ? text.imageUpload : ADMIN_COPY.common.actionFailed,
      }));
    } finally {
      setUploading(false);
    }
  };

  const previewSource = preview ?? (imageKey.trim() ? assetUrl(imageKey.trim()) : null);
  const mainLabel = editing ? copy.save : copy.add;
  const mobileLabel = editing ? copy.saveShort : copy.addShort;
  const slugHint = editing ? copy.slugHintEdit(slug) : copy.slugHintNew;

  return (
    <div className="admin-page compose item-form">
      <PageHead
        title={editing ? copy.editTitle : copy.createTitle}
        action={
          <span className="only-desktop">
            <Button variant="secondary" size="m" to={PATH}>
              {copy.cancel}
            </Button>
            <Button size="m" disabled={saving} onClick={save}>
              {mainLabel}
            </Button>
          </span>
        }
      />
      {notice ? <Notice tone={notice.tone} label={notice.label} /> : null}
      <form className="compose__layout" noValidate onSubmit={(event) => event.preventDefault()}>
        <div className="compose__main item-form__main">
          <Field
            fill
            id={ids.name}
            name="name"
            label={copy.nameLabel}
            placeholder={copy.namePlaceholder}
            hint={copy.nameHint(length(name.trim()))}
            error={errors.name}
            value={name}
            autoComplete="off"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setName(event.target.value);
              clear("name");
            }}
          />
          <Field
            fill
            id={ids.slug}
            name="slug"
            label={copy.slugLabel}
            placeholder={copy.slugPlaceholder}
            hint={slugHint}
            error={errors.slug}
            value={slug}
            disabled={editing}
            autoComplete="off"
            spellCheck={false}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setSlug(event.target.value);
              clear("slug");
            }}
          />
          <fieldset
            className="compose__group"
            aria-describedby={errors.group ? `${ids.group}-error` : undefined}
          >
            <legend className="compose__label text-label-m">{copy.groupLabel}</legend>
            <div id={ids.group} className="compose__chips item-form__chips" tabIndex={-1}>
              {ITEM_GROUP_KEYS.map((key) => (
                <Chip key={key} selected={group === key} onClick={() => pickGroup(key)}>
                  {ITEM_GROUP_LABEL[key]}
                </Chip>
              ))}
            </div>
            {errors.group ? (
              <p id={`${ids.group}-error`} className="compose__error text-body-s" role="alert">
                {errors.group}
              </p>
            ) : null}
          </fieldset>
          <Field
            fill
            id={ids.typeLabel}
            name="typeLabel"
            label={copy.typeLabel}
            placeholder={copy.typePlaceholder}
            hint={copy.typeHint}
            error={errors.typeLabel}
            value={typeLabel}
            autoComplete="off"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setTypeLabel(event.target.value);
              clear("typeLabel");
            }}
          />
          <fieldset
            className="compose__group"
            aria-describedby={`${ids.stats}-hint`}
            id={ids.stats}
            tabIndex={-1}
          >
            <legend className="compose__label text-label-m">{copy.statsLabel}</legend>
            <div className="item-stats">
              <div className="item-stats__head text-label-m" aria-hidden="true">
                <span>{copy.statsLabelColumn}</span>
                <span>{copy.statsValueColumn}</span>
                <span />
              </div>
              {stats.map((row, index) => (
                <div key={row.key} className="item-stats__row">
                  <input
                    className="item-input item-input--label text-body-m"
                    aria-label={copy.statLabelAria(index + 1)}
                    value={row.label}
                    autoComplete="off"
                    onChange={(event) => changeStat(row.key, { label: event.target.value })}
                  />
                  <input
                    className="item-input text-body-m"
                    aria-label={copy.statValueAria(index + 1)}
                    placeholder={copy.statValuePlaceholder}
                    value={row.value}
                    autoComplete="off"
                    onChange={(event) => changeStat(row.key, { value: event.target.value })}
                  />
                  <Button
                    variant="ghost"
                    size="m"
                    onClick={() => {
                      setStats((rows) => rows.filter((candidate) => candidate.key !== row.key));
                      clear("stats");
                    }}
                  >
                    {copy.statRemove}
                    <span className="visually-hidden">: {copy.statLabelAria(index + 1)}</span>
                  </Button>
                </div>
              ))}
              <Button
                variant="secondary"
                size="m"
                className="item-stats__add"
                disabled={stats.length >= LIMITS.stats}
                onClick={() =>
                  setStats((rows) => [...rows, { key: nextKey(), label: "", value: "" }])
                }
              >
                {copy.statAdd}
              </Button>
              {errors.stats ? (
                <p className="compose__error text-body-s" role="alert">
                  {errors.stats}
                </p>
              ) : null}
              <p id={`${ids.stats}-hint`} className="item-form__hint text-body-s">
                {copy.statsHint}
              </p>
            </div>
          </fieldset>
          <Field
            fill
            id={ids.statLine}
            name="statLine"
            label={copy.statLineLabel}
            placeholder={copy.statLinePlaceholder}
            hint={copy.statLineHint}
            error={errors.statLine}
            value={statLine}
            autoComplete="off"
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setStatLine(event.target.value);
              clear("statLine");
            }}
          />
          <div className={cn("field field--fill", errors.description && "field--error")}>
            <label className="field__label text-label-m" htmlFor={ids.description}>
              {copy.descriptionLabel}
            </label>
            <div className="field__box item-textarea">
              <textarea
                id={ids.description}
                name="description"
                className="field__input item-textarea__input text-body-m"
                placeholder={copy.descriptionPlaceholder}
                value={description}
                aria-invalid={errors.description ? true : undefined}
                aria-describedby={`${ids.description}-hint`}
                onChange={(event) => {
                  setDescription(event.target.value);
                  clear("description");
                }}
              />
            </div>
            <p id={`${ids.description}-hint`} className="field__hint text-body-s">
              {errors.description ?? copy.descriptionHint(length(description.trim()))}
            </p>
          </div>
          <div className="compose__group">
            <span className="compose__label text-label-m">{copy.imageLabel}</span>
            <div className="item-image">
              <div className="item-image__preview">
                {previewSource ? (
                  <img src={previewSource} alt="" />
                ) : (
                  <span className="text-label-m">{copy.imageEmpty}</span>
                )}
              </div>
              <div className="item-image__fields">
                <Field
                  fill
                  id={ids.imageKey}
                  name="imageKey"
                  label={copy.imageKeyLabel}
                  placeholder={copy.imageKeyPlaceholder}
                  hint={copy.imageKeyHint}
                  error={errors.imageKey}
                  value={imageKey}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setImageKey(event.target.value);
                    setPreview(null);
                    clear("imageKey");
                  }}
                />
                <Button
                  variant="secondary"
                  size="m"
                  className="item-image__pick"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {imageKey.trim() ? copy.imageChange : copy.imagePick}
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  name="imageFile"
                  className="visually-hidden"
                  accept={IMAGE_TYPES.join(",")}
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(event) => {
                    void pickImage(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <aside className="compose__panel" aria-labelledby={`${ids.group}-panel`}>
          <h2 id={`${ids.group}-panel`} className="compose__panel-title text-label-l">
            <span className="compose__bar" aria-hidden="true" />
            {copy.panelTitle}
          </h2>
          <div className="compose__rows">
            <dl className="item-form__kv">
              <PanelRow label={copy.date}>
                <span className="item-form__date text-data-m">
                  {formatDateTime(item?.publishedAt ?? getNow())}
                </span>
              </PanelRow>
            </dl>
            <dl className="item-form__kv">
              <PanelRow label={copy.featured}>
                <fieldset className="compose__pair">
                  <legend className="visually-hidden">{copy.featured}</legend>
                  <Chip
                    selected={featured}
                    onClick={() => {
                      setFeatured(true);
                      clear("featured");
                    }}
                  >
                    {copy.on}
                  </Chip>
                  <Chip
                    selected={!featured}
                    onClick={() => {
                      setFeatured(false);
                      clear("featured");
                    }}
                  >
                    {copy.off}
                  </Chip>
                </fieldset>
              </PanelRow>
            </dl>
            {errors.featured || featuredNote ? (
              <p
                className={cn(
                  "item-form__note text-body-s",
                  errors.featured && "item-form__note--error",
                )}
                role={errors.featured ? "alert" : undefined}
              >
                {errors.featured ?? featuredNote}
              </p>
            ) : null}
            <dl className="item-form__kv">
              <PanelRow label={copy.visible}>
                <fieldset className="compose__pair">
                  <legend className="visually-hidden">{copy.visible}</legend>
                  <Chip selected={visible} onClick={() => setVisible(true)}>
                    {copy.show}
                  </Chip>
                  <Chip selected={!visible} onClick={() => setVisible(false)}>
                    {copy.hide}
                  </Chip>
                </fieldset>
              </PanelRow>
            </dl>
            <div className="item-form__game">
              <Field
                fill
                id={ids.gameItemId}
                name="gameItemId"
                label={copy.gameIdLabel}
                placeholder={copy.gameIdPlaceholder}
                error={errors.gameItemId}
                value={gameItemId}
                autoComplete="off"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setGameItemId(event.target.value);
                  clear("gameItemId");
                }}
              />
            </div>
          </div>
          <div className="compose__panel-actions">
            <Button size="l" fill disabled={saving} onClick={save}>
              {mainLabel}
            </Button>
            <Button variant="secondary" size="l" fill to={PATH}>
              {copy.cancel}
            </Button>
          </div>
        </aside>
      </form>
      <div className="compose__bar-mobile">
        <Button variant="secondary" size="l" fill to={PATH}>
          {copy.cancel}
        </Button>
        <Button size="l" fill disabled={saving} onClick={save}>
          {mobileLabel}
        </Button>
      </div>
    </div>
  );
}
