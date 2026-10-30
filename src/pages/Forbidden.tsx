import "./Forbidden.css";
import { Button } from "../components/Button/Button.tsx";
import { FormCard } from "../components/FormCard/FormCard.tsx";
import { Notice } from "../components/Notice/Notice.tsx";
import { usePageMeta } from "../components/PageShell/PageShell.tsx";
import { PAGE_COPY } from "../content/pages.ts";

/** Trang 403: người chơi vào khu quản trị. Không chuyển hướng ngầm (ROUTES-AND-DATA.md mục 4). */
export function Forbidden() {
  const copy = PAGE_COPY.forbidden;
  usePageMeta({ title: copy.pageTitle, chrome: "error" });
  return (
    <div className="forbidden container">
      <FormCard title={copy.title}>
        <Notice tone="error" label={copy.label}>
          {copy.message}
        </Notice>
        <Button to="/" size="l" fill>
          {copy.action}
        </Button>
      </FormCard>
    </div>
  );
}
