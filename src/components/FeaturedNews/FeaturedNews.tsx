import { Link } from "react-router";
import type { NewsSummary } from "../../api/schemas.ts";
import { NEWS_CATEGORY_LABEL } from "../../content/labels.ts";
import { PAGE_COPY } from "../../content/pages.ts";
import { assetSize, assetUrl } from "../../lib/assets.ts";
import { getNow } from "../../lib/clock.ts";
import { formatDateFull, formatDateShort } from "../../lib/format.ts";
import { Button } from "../Button/Button.tsx";
import { CornerMarks } from "../CornerMarks/CornerMarks.tsx";
import { CATEGORY_TAG, Tag } from "../Tag/Tag.tsx";
import "./FeaturedNews.css";

const copy = PAGE_COPY.newsPage;

/**
 * Bài nổi bật (COMPONENTS.md, Featured). Máy tính: ảnh bên trái, chữ bên phải. Điện thoại: thẻ dọc.
 * Ảnh bìa là ảnh thật của bài. Bài không có ảnh thì bỏ khay ảnh và chữ chiếm cả thẻ.
 */
export function FeaturedNews({ post }: { post: NewsSummary }) {
  const size = post.coverImageKey ? assetSize(post.coverImageKey) : null;
  const href = `/tin-tuc/${post.slug}`;
  return (
    <article className="featured-news" aria-label={copy.featuredLabel}>
      {post.coverImageKey ? (
        <div className="featured-news__visual pattern-cross">
          <img
            className="featured-news__image"
            src={assetUrl(post.coverImageKey)}
            width={size?.[0]}
            height={size?.[1]}
            alt=""
          />
          <CornerMarks className="only-desktop" />
        </div>
      ) : null}
      <div className="featured-news__body">
        <div className="featured-news__top">
          <Tag variant={CATEGORY_TAG[post.category] ?? "news"}>
            {NEWS_CATEGORY_LABEL[post.category]}
          </Tag>
          <time
            className="featured-news__short-date text-data-m only-mobile"
            dateTime={post.publishedAt}
          >
            {formatDateShort(post.publishedAt, getNow())}
          </time>
        </div>
        <h2 className="featured-news__title text-heading-h2">
          <Link className="featured-news__title-link" to={href}>
            {post.title}
          </Link>
        </h2>
        <p className="featured-news__excerpt">{post.excerpt}</p>
        <p className="featured-news__meta text-label-m only-desktop">
          <time dateTime={post.publishedAt}>{formatDateFull(post.publishedAt)}</time>
          {post.authorName ? ` · ${post.authorName}` : null}
        </p>
        {/* Bản vẽ: máy tính dùng Primary M, điện thoại dùng Ghost M (chữ cam, không nền). */}
        <Button className="featured-news__action featured-news__action--desktop" to={href} size="m">
          {copy.readMore}
        </Button>
        <Button
          className="featured-news__action featured-news__action--mobile"
          variant="ghost"
          to={href}
          size="m"
          aria-label={`${copy.readMore}: ${post.title}`}
        >
          {copy.readMore}
        </Button>
      </div>
    </article>
  );
}
