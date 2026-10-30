import { Link } from "react-router";
import type { NewsSummary } from "../../api/schemas.ts";
import { NEWS_CATEGORY_LABEL } from "../../content/labels.ts";
import { getNow } from "../../lib/clock.ts";
import { formatDateShort } from "../../lib/format.ts";
import { CATEGORY_TAG, Tag } from "../Tag/Tag.tsx";
import "./NewsRow.css";

/**
 * Một dòng tin. Máy tính: Tag, tiêu đề, ngày trên một hàng (NewsRow). Điện thoại: thẻ dọc (NewsCard).
 * Cả dòng là một liên kết đến bài viết.
 */
export function NewsRow({ post }: { post: NewsSummary }) {
  return (
    <li className="news-row">
      <Link className="news-row__link" to={`/tin-tuc/${post.slug}`}>
        <Tag variant={CATEGORY_TAG[post.category] ?? "news"} className="news-row__tag">
          {NEWS_CATEGORY_LABEL[post.category]}
        </Tag>
        <span className="news-row__title text-heading-h3">{post.title}</span>
        <time className="news-row__date text-data-m" dateTime={post.publishedAt}>
          {formatDateShort(post.publishedAt, getNow())}
        </time>
      </Link>
    </li>
  );
}

export function NewsList({
  posts,
  label,
  className,
}: {
  posts: readonly NewsSummary[];
  /** Tên của danh sách cho trình đọc màn hình. */
  label?: string;
  className?: string;
}) {
  return (
    <ul className={className ? `news-list ${className}` : "news-list"} aria-label={label}>
      {posts.map((post) => (
        <NewsRow key={post.slug} post={post} />
      ))}
    </ul>
  );
}
