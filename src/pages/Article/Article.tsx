import { useParams } from "react-router";
import { getNewsDetail } from "../../api/endpoints.ts";
import type { NewsDetail } from "../../api/schemas.ts";
import { Breadcrumbs } from "../../components/Breadcrumbs/Breadcrumbs.tsx";
import { Button } from "../../components/Button/Button.tsx";
import { CornerMarks } from "../../components/CornerMarks/CornerMarks.tsx";
import { NewsList } from "../../components/NewsRow/NewsRow.tsx";
import { usePageMeta } from "../../components/PageShell/PageShell.tsx";
import { Prose } from "../../components/Prose/Prose.tsx";
import { RadioLine } from "../../components/RadioLine/RadioLine.tsx";
import { ResourceView } from "../../components/ResourceView/ResourceView.tsx";
import { SectionHead } from "../../components/SectionHead/SectionHead.tsx";
import { CATEGORY_TAG, Tag } from "../../components/Tag/Tag.tsx";
import { NEWS_CATEGORY_LABEL } from "../../content/labels.ts";
import { LIST_COPY } from "../../content/lists.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { useResource } from "../../hooks/useResource.ts";
import { assetSize, assetUrl } from "../../lib/assets.ts";
import { formatDateFull, readingMinutes } from "../../lib/format.ts";
import { htmlToText, sanitizeHtml } from "../../lib/sanitize.ts";
import { NotFound } from "../NotFound.tsx";
import "./Article.css";

const copy = PAGE_COPY.articlePage;

/** Đầu bài: Tag loại, dòng ngày, tác giả, thời gian đọc, rồi tiêu đề H1. */
function ArticleHead({ post, minutes }: { post: NewsDetail; minutes: number }) {
  return (
    <>
      <div className="article-head__meta">
        <Tag variant={CATEGORY_TAG[post.category] ?? "news"}>
          {NEWS_CATEGORY_LABEL[post.category]}
        </Tag>
        <p className="article-head__info text-label-m">
          <time dateTime={post.publishedAt}>{formatDateFull(post.publishedAt)}</time>
          {post.authorName ? <span className="only-desktop"> · {post.authorName}</span> : null}
          {` · ${copy.readingTime(minutes)}`}
        </p>
      </div>
      <h1 className="article-head__title text-heading-h1">{post.title}</h1>
    </>
  );
}

function ArticleHero({ imageKey }: { imageKey: string }) {
  const size = assetSize(imageKey);
  return (
    <div className="article-hero pattern-cross">
      <img
        className="article-hero__image"
        src={assetUrl(imageKey)}
        width={size?.[0]}
        height={size?.[1]}
        alt=""
      />
      <CornerMarks className="only-mobile" inset={8} />
      <CornerMarks className="only-desktop" />
    </div>
  );
}

/** Chi tiết bài viết (E1-S4). Bài không có, đang nháp hoặc chưa đến giờ đăng thì hiện trang 404. */
export function Article() {
  const { slug = "" } = useParams();
  const article = useResource((signal) => getNewsDetail(slug, { signal }), [slug]);
  const post = article.status === "success" ? article.data : null;

  usePageMeta({
    title: post ? copy.pageTitle(post.title) : undefined,
    description: post?.excerpt || undefined,
  });

  if (article.status === "error" && article.error.code === "not_found") return <NotFound />;

  const minutes = post ? readingMinutes(htmlToText(sanitizeHtml(post.bodyHtml))) : 1;

  return (
    <>
      <header className="article-head">
        <Breadcrumbs
          label={copy.crumbs}
          crumbs={[
            { label: copy.crumbHome, to: "/" },
            { label: copy.crumbNews, to: "/tin-tuc" },
            { label: copy.crumbArticle },
          ]}
        />
        {post ? <ArticleHead post={post} minutes={minutes} /> : null}
      </header>
      <ResourceView resource={article} copy={LIST_COPY.news} className="article__state">
        {(data) => (
          <article className="article">
            {data.coverImageKey ? <ArticleHero imageKey={data.coverImageKey} /> : null}
            <div className="article__reading">
              <Prose html={data.bodyHtml} />
              <RadioLine label={copy.radioLabel}>{copy.radioText}</RadioLine>
            </div>
            <div className="article-more">
              {data.related.length > 0 ? (
                <>
                  <SectionHead
                    id="article-more-title"
                    overline={copy.moreOverline}
                    title={copy.moreTitle}
                  />
                  <NewsList posts={data.related} label={copy.moreLabel} />
                </>
              ) : null}
              <div className="article-more__back">
                <Button variant="ghost" to="/tin-tuc">
                  {copy.back}
                </Button>
              </div>
            </div>
          </article>
        )}
      </ResourceView>
    </>
  );
}
