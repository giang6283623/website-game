import {
  type ChangeEvent,
  type DragEvent,
  type MouseEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  createAdminNews,
  getAdminNews,
  getAdminNewsPost,
  type NewsDraft,
  updateAdminNews,
  uploadImage,
} from "../../api/admin-endpoints.ts";
import { normalizeError } from "../../api/client.ts";
import { NEWS_CATEGORY_KEYS, type NewsCategoryKey, type NewsPost } from "../../api/schemas.ts";
import { Button } from "../../components/Button/Button.tsx";
import { Chip } from "../../components/Chip/Chip.tsx";
import { Field } from "../../components/Field/Field.tsx";
import { Notice } from "../../components/Notice/Notice.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { CATEGORY_TAG, Tag } from "../../components/Tag/Tag.tsx";
import { ADMIN_COPY, ADMIN_LIST_COPY } from "../../content/admin.ts";
import { NEWS_CATEGORY_LABEL } from "../../content/labels.ts";
import { useResource } from "../../hooks/useResource.ts";
import { assetUrl } from "../../lib/assets.ts";
import { getNow } from "../../lib/clock.ts";
import { cn } from "../../lib/cn.ts";
import { formatDateShort, formatDateTime } from "../../lib/format.ts";
import { isSafeHref, sanitizeHtml } from "../../lib/sanitize.ts";
import { PageHead, PanelRow, useUnsavedGuard } from "./parts.tsx";
import "../../components/NewsRow/NewsRow.css";
import "./Compose.css";

const PATH = "/quan-tri/bai-viet";
const copy = ADMIN_COPY.compose;
const text = copy.messages;
const TITLE_MAX = 80;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

type Errors = Partial<Record<"title" | "category" | "bodyHtml" | "cover", string>>;
type NoticeState = { tone: "success" | "error"; label: string };

/** Soạn bài hoặc sửa bài (E4-S2, E4-S3). Có `:id` trên địa chỉ thì tải bài rồi sửa, không thì soạn mới. */
export function ComposePage() {
  const { id } = useParams();
  const editingId = id !== undefined && /^\d{1,9}$/.test(id) ? Number(id) : null;
  const invalid = id !== undefined && editingId === null;
  const resource = useResource(
    (signal) => getAdminNewsPost(editingId ?? 0, { signal }),
    [editingId],
    {
      enabled: editingId !== null,
    },
  );

  if (invalid) return <MissingPost />;
  if (editingId === null) return <ComposeForm key="new" post={null} />;
  return (
    <ResourceView
      resource={resource}
      copy={{
        ...ADMIN_LIST_COPY.posts,
        errorTitle: copy.loadFailed,
      }}
    >
      {(post) => <ComposeForm key={post.id} post={post} />}
    </ResourceView>
  );
}

function MissingPost() {
  return (
    <div className="admin-page">
      <PageHead title={copy.editTitle} />
      <Link className="admin-action text-label-m" to={PATH}>
        {ADMIN_COPY.posts.title}
      </Link>
    </div>
  );
}

function ComposeForm({ post }: { post: NewsPost | null }) {
  const navigate = useNavigate();
  const location = useLocation();
  const flash = (location.state as { flash?: string } | null)?.flash ?? null;
  const editing = post !== null;
  const published = post?.status === "published";

  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState<NewsCategoryKey | null>(post?.category ?? null);
  const [bodyHtml, setBodyHtml] = useState(post?.bodyHtml ?? "");
  const [coverKey, setCoverKey] = useState<string | null>(post?.coverImageKey ?? null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    post?.coverImageKey ? assetUrl(post.coverImageKey) : null,
  );
  const [pinned, setPinned] = useState(post?.pinned ?? false);
  const [errors, setErrors] = useState<Errors>({});
  const [notice, setNotice] = useState<NoticeState | null>(
    flash ? { tone: "success", label: flash } : null,
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Mốc để biết có thay đổi chưa lưu hay không. Đặt lại sau mỗi lần lưu thành công.
  const [saved, setSaved] = useState(() =>
    JSON.stringify([
      post?.title ?? "",
      post?.category ?? null,
      post?.bodyHtml ?? "",
      post?.coverImageKey ?? null,
      post?.pinned ?? false,
    ]),
  );
  const current = JSON.stringify([title, category, bodyHtml, coverKey, pinned]);
  const dirty = current !== saved;

  const titleId = useId();
  const categoryId = useId();
  const bodyId = useId();
  const coverId = useId();

  useUnsavedGuard(dirty && !saving, text.leave);

  const recent = useResource(
    (signal) => getAdminNews({ status: "published", limit: 5 }, { signal }),
    [],
  );
  const recentRows =
    recent.status === "success"
      ? recent.data.items.filter((row) => row.id !== post?.id).slice(0, 4)
      : [];

  /** Kiểm trước khi gọi API. Nháp chỉ cần tiêu đề. Đăng bài cần đủ phân loại và nội dung. */
  const check = (target: "draft" | "published"): Errors => {
    const found: Errors = {};
    const trimmed = title.trim();
    if (!trimmed) found.title = text.titleEmpty;
    else if (trimmed.length > TITLE_MAX) found.title = text.titleTooLong;
    if (target === "published") {
      if (!category) found.category = text.categoryEmpty;
      if (!bodyHtml.replace(/<[^>]*>/g, "").trim()) found.bodyHtml = text.bodyEmpty;
    }
    return found;
  };

  const save = async (target: "draft" | "published") => {
    if (saving || uploading) return;
    const found = check(target);
    setErrors(found);
    setNotice(null);
    if (Object.keys(found).length > 0) {
      const target = found.title ? titleId : found.category ? categoryId : bodyId;
      document.getElementById(target)?.focus();
      return;
    }
    setSaving(true);
    const draft: NewsDraft = {
      title: title.trim(),
      category,
      bodyHtml: sanitizeHtml(bodyHtml),
      coverImageKey: coverKey,
      pinned,
      status: target,
    };
    try {
      const result = post ? await updateAdminNews(post.id, draft) : await createAdminNews(draft);
      setSaved(current);
      if (target === "published" && !published) {
        navigate(PATH, { state: { flash: text.published }, replace: true });
      } else if (!post) {
        navigate(`${PATH}/${result.id}`, { state: { flash: text.draftSaved }, replace: true });
      } else {
        setNotice({ tone: "success", label: published ? text.saved : text.draftSaved });
      }
    } catch (failure) {
      const known = normalizeError(failure);
      if (known.status === 422 && Object.keys(known.fields).length > 0) {
        setErrors({
          title: known.fields.title,
          category: known.fields.category,
          bodyHtml: known.fields.bodyHtml,
        });
      } else {
        setNotice({ tone: "error", label: text.saveFailed });
      }
    } finally {
      setSaving(false);
    }
  };

  const pickCover = async (file: File | null | undefined) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_MAX_BYTES) {
      setErrors((previous) => ({ ...previous, cover: text.imageInvalid }));
      return;
    }
    setErrors((previous) => ({ ...previous, cover: undefined }));
    setUploading(true);
    try {
      const result = await uploadImage(file);
      setCoverKey(result.imageKey);
      setCoverPreview(
        typeof URL.createObjectURL === "function"
          ? URL.createObjectURL(file)
          : assetUrl(result.imageKey),
      );
    } catch (failure) {
      const known = normalizeError(failure);
      setErrors((previous) => ({
        ...previous,
        cover: known.status === 422 ? text.imageInvalid : ADMIN_COPY.common.actionFailed,
      }));
    } finally {
      setUploading(false);
    }
  };

  const length = Array.from(title).length;
  const heading = editing ? copy.editTitle : copy.createTitle;
  const mainAction = published ? copy.saveChanges : copy.publish;
  const mainActionNow = published ? copy.saveChanges : copy.publishNow;

  return (
    <div className="admin-page compose">
      <PageHead
        title={heading}
        action={
          <span className="only-desktop">
            {published ? null : (
              <Button variant="secondary" size="m" disabled={saving} onClick={() => save("draft")}>
                {copy.saveDraft}
              </Button>
            )}
            <Button size="m" disabled={saving} onClick={() => save("published")}>
              {mainAction}
            </Button>
          </span>
        }
      />
      {notice ? <Notice tone={notice.tone} label={notice.label} /> : null}
      <form className="compose__layout" noValidate onSubmit={(event) => event.preventDefault()}>
        <div className="compose__main">
          <Field
            fill
            id={titleId}
            name="title"
            label={copy.titleLabel}
            hint={copy.titleHint(length)}
            error={errors.title}
            value={title}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              setTitle(event.target.value);
              if (errors.title) setErrors((previous) => ({ ...previous, title: undefined }));
            }}
            autoComplete="off"
          />
          <fieldset
            className="compose__group"
            aria-describedby={errors.category ? `${categoryId}-error` : undefined}
          >
            <legend className="compose__label text-label-m">{copy.categoryLabel}</legend>
            <div id={categoryId} className="compose__chips" tabIndex={-1}>
              {NEWS_CATEGORY_KEYS.map((key) => (
                <Chip
                  key={key}
                  selected={category === key}
                  onClick={() => {
                    setCategory(key);
                    setErrors((previous) => ({ ...previous, category: undefined }));
                  }}
                >
                  {NEWS_CATEGORY_LABEL[key]}
                </Chip>
              ))}
            </div>
            {errors.category ? (
              <p id={`${categoryId}-error`} className="compose__error text-body-s" role="alert">
                {errors.category}
              </p>
            ) : null}
          </fieldset>
          <div className="compose__group">
            <span id={`${bodyId}-label`} className="compose__label text-label-m">
              {copy.bodyLabel}
            </span>
            <RichEditor
              id={bodyId}
              labelledBy={`${bodyId}-label`}
              initialHtml={post?.bodyHtml ?? ""}
              invalid={Boolean(errors.bodyHtml)}
              onChange={(html) => {
                setBodyHtml(html);
                if (errors.bodyHtml)
                  setErrors((previous) => ({ ...previous, bodyHtml: undefined }));
              }}
              onImageError={(message) =>
                setErrors((previous) => ({ ...previous, bodyHtml: message }))
              }
            />
            {errors.bodyHtml ? (
              <p className="compose__error text-body-s" role="alert">
                {errors.bodyHtml}
              </p>
            ) : null}
          </div>
          <CoverDrop
            id={coverId}
            preview={coverPreview}
            error={errors.cover}
            busy={uploading}
            onPick={pickCover}
            onRemove={() => {
              setCoverKey(null);
              setCoverPreview(null);
            }}
          />
        </div>
        <aside className="compose__panel" aria-labelledby={`${coverId}-panel`}>
          <h2 id={`${coverId}-panel`} className="compose__panel-title text-label-l">
            <span className="compose__bar" aria-hidden="true" />
            {copy.panelTitle}
          </h2>
          <dl className="compose__rows">
            <PanelRow label={copy.status}>
              <Tag variant="guide">
                {published ? ADMIN_COPY.posts.status.published : ADMIN_COPY.posts.status.draft}
              </Tag>
            </PanelRow>
            <PanelRow label={copy.date}>
              <span className="text-data-m">{formatDateTime(post?.publishedAt ?? getNow())}</span>
            </PanelRow>
            <PanelRow label={copy.author}>
              <span className="text-body-m">{post?.authorName ?? copy.authorDefault}</span>
            </PanelRow>
            <PanelRow label={copy.pinned}>
              <fieldset className="compose__pair">
                <legend className="visually-hidden">{copy.pinned}</legend>
                <Chip selected={pinned} onClick={() => setPinned(true)}>
                  {copy.on}
                </Chip>
                <Chip selected={!pinned} onClick={() => setPinned(false)}>
                  {copy.off}
                </Chip>
              </fieldset>
            </PanelRow>
          </dl>
          <div className="compose__panel-actions">
            <Button size="l" fill disabled={saving} onClick={() => save("published")}>
              {mainActionNow}
            </Button>
            {published ? null : (
              <Button
                variant="secondary"
                size="l"
                fill
                disabled={saving}
                onClick={() => save("draft")}
              >
                {copy.saveDraft}
              </Button>
            )}
          </div>
        </aside>
      </form>
      {recentRows.length > 0 ? (
        <section className="compose__recent" aria-labelledby={`${coverId}-recent`}>
          <h2 id={`${coverId}-recent`} className="compose__recent-title text-heading-h2">
            {copy.recent}
          </h2>
          <ul className="news-list" aria-label={copy.recentLabel}>
            {recentRows.map((row) => (
              <li key={row.id} className="news-row">
                <Link className="news-row__link" to={`${PATH}/${row.id}`}>
                  <Tag variant={CATEGORY_TAG[row.category] ?? "news"} className="news-row__tag">
                    {NEWS_CATEGORY_LABEL[row.category]}
                  </Tag>
                  <span className="news-row__title text-heading-h3">{row.title}</span>
                  <time
                    className="news-row__date text-data-m"
                    dateTime={row.publishedAt ?? undefined}
                  >
                    {formatDateShort(row.publishedAt ?? row.updatedAt, getNow())}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <div className="compose__bar-mobile">
        {published ? null : (
          <Button variant="secondary" size="l" fill disabled={saving} onClick={() => save("draft")}>
            {copy.saveDraft}
          </Button>
        )}
        <Button size="l" fill disabled={saving} onClick={() => save("published")}>
          {published ? copy.saveChanges : copy.mobilePublish}
        </Button>
      </div>
    </div>
  );
}

type Command = "bold" | "italic" | "insertUnorderedList" | "createLink" | "image";

/**
 * Ô soạn nội dung: vùng contenteditable với thanh công cụ ĐẬM, NGHIÊNG, DANH SÁCH, LIÊN KẾT, ẢNH.
 * HTML ra khỏi ô luôn qua `sanitizeHtml` ở bước lưu. Ô không điều khiển từ ngoài: `initialHtml` chỉ nạp một lần.
 */
function RichEditor({
  id,
  labelledBy,
  initialHtml,
  invalid,
  onChange,
  onImageError,
}: {
  id: string;
  labelledBy: string;
  initialHtml: string;
  invalid: boolean;
  onChange: (html: string) => void;
  onImageError: (message: string) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: chỉ nạp nội dung ban đầu một lần khi gắn ô
  useEffect(() => {
    if (areaRef.current) areaRef.current.innerHTML = sanitizeHtml(initialHtml);
  }, []);

  const emit = () => onChange(areaRef.current?.innerHTML ?? "");

  const run = (command: Command) => {
    const area = areaRef.current;
    if (!area) return;
    area.focus();
    if (command === "createLink") {
      const url = window.prompt(copy.linkPrompt, "https://")?.trim();
      if (!url || !isSafeHref(url)) return;
      document.execCommand?.("createLink", false, url);
    } else if (command === "image") {
      fileRef.current?.click();
      return;
    } else {
      document.execCommand?.(command, false);
    }
    emit();
  };

  const insertImage = async (file: File | undefined) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > IMAGE_MAX_BYTES) {
      onImageError(text.imageInvalid);
      return;
    }
    try {
      const result = await uploadImage(file);
      areaRef.current?.focus();
      document.execCommand?.("insertImage", false, assetUrl(result.imageKey));
      emit();
    } catch {
      onImageError(text.imageInvalid);
    }
  };

  const tools: { command: Command; label: string }[] = [
    { command: "bold", label: copy.toolbar.bold },
    { command: "italic", label: copy.toolbar.italic },
    { command: "insertUnorderedList", label: copy.toolbar.list },
    { command: "createLink", label: copy.toolbar.link },
    { command: "image", label: copy.toolbar.image },
  ];

  return (
    <div className={cn("editor", invalid && "editor--invalid")}>
      <div
        className="editor__toolbar"
        role="toolbar"
        aria-label={copy.toolbarLabel}
        aria-controls={id}
      >
        {tools.map((tool) => (
          <button
            key={tool.command}
            type="button"
            className="editor__tool text-label-m"
            data-command={tool.command}
            // Giữ vùng chọn trong ô khi bấm công cụ.
            onMouseDown={(event: MouseEvent) => event.preventDefault()}
            onClick={() => run(tool.command)}
          >
            {tool.label}
          </button>
        ))}
        <input
          ref={fileRef}
          type="file"
          className="visually-hidden"
          accept={IMAGE_TYPES.join(",")}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            void insertImage(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {/* biome-ignore lint/a11y/useSemanticElements: vùng soạn có định dạng cần contenteditable, không thay bằng textarea được */}
      <div
        ref={areaRef}
        id={id}
        className="editor__area prose text-body-m"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        tabIndex={0}
        aria-multiline="true"
        aria-labelledby={labelledBy}
        aria-invalid={invalid ? true : undefined}
        onInput={emit}
        onBlur={emit}
      />
    </div>
  );
}

/** Vùng thả ảnh đại diện (E4-S3). Kiểm loại và dung lượng ở trình duyệt trước, máy chủ kiểm lại. */
function CoverDrop({
  id,
  preview,
  error,
  busy,
  onPick,
  onRemove,
}: {
  id: string;
  preview: string | null;
  error?: string;
  busy: boolean;
  onPick: (file: File | null | undefined) => void;
  onRemove: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setOver(false);
    onPick(event.dataTransfer?.files?.[0]);
  };

  return (
    <div className="compose__group">
      <span id={`${id}-label`} className="compose__label text-label-m">
        {copy.coverLabel}
      </span>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: vùng thả chỉ là thêm cho người dùng chuột, nút CHỌN ẢNH là đường dùng bàn phím */}
      <div
        className={cn("cover", over && "cover--over", error && "cover--error")}
        onDragOver={(event) => {
          event.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
      >
        {preview ? (
          <img className="cover__image" src={preview} alt={copy.coverAlt} />
        ) : (
          <p className="cover__text text-body-m">
            <span className="only-desktop">{copy.coverDrop}</span>
            <span className="only-mobile">{copy.coverDropMobile}</span>
          </p>
        )}
        <div className="cover__actions">
          <Button
            variant="secondary"
            size="m"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {preview ? copy.coverReplace : copy.coverPick}
          </Button>
          {preview ? (
            <Button variant="ghost" size="m" onClick={onRemove}>
              {copy.coverRemove}
            </Button>
          ) : null}
        </div>
        <input
          ref={fileRef}
          id={id}
          type="file"
          name="cover"
          className="visually-hidden"
          accept={IMAGE_TYPES.join(",")}
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => {
            onPick(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>
      {error ? (
        <p className="compose__error text-body-s" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
