# Project context

> A short, shared glossary and map so any
> reader navigates this project with less back-and-forth.
> Keep it current and terse - definitions, not prose.

## Domain glossary

Terms, acronyms, and entities specific to this project. One line each.
One word, one meaning: when several words name the same thing, keep one as the term and list the others after "Avoid".

- **Tần số sinh tồn** - hướng thiết kế của website. Thanh điều hướng là núm dò tần số, thẻ nội dung là thẻ kho đồ. Avoid: giao diện radio, theme radio, điện đài.
- **API giả** - máy chủ giả đọc dữ liệu từ `sample-data.json`, dùng để thử giao diện khi chưa có máy chủ thật. Avoid: mock, fake API, API ảo.

## Key areas

Where the important things live, so agents jump straight to them.

- Entry point(s): chưa có code. Thiết kế nằm trong Figma, tệp `FIGMA_FILE_KEY`.
- Core domain logic: chưa có.
- Configuration: cấu hình dự án.
- Tests: chưa có.
- Build/deploy: chưa có.

## Conventions in use

Pointers to the patterns this repo already follows (also captured in cấu hình dự án `conventions`).

- Naming: giao diện viết bằng tiếng Việt. Tên mã chưa quy định.
- Architecture / folder layout: đề xuất trong `.private/docs/design-handoff/IMPLEMENTATION-PLAN.md`.
- Shared resources (assets, routes, config, generated code) - accessor to use: giá trị thiết kế trong `design-values.json`, hình trong `ASSET-MAP.md`, đường dẫn và API trong `ROUTES-AND-DATA.md` (cùng thư mục `design-handoff`).
- User-facing copy / localization - accessor to use: `CONTENT-COPY.md` (cùng thư mục `design-handoff`).

## External systems & integrations

- Services, APIs, queues, or third parties this project talks to: site cũ `https://MOCKAPI/` (chỉ đọc để tham khảo). Thư mục client game `InfestationVN` (chỉ đọc). Dịch vụ API cho website chưa chọn.
- Credentials/secrets location (names only, never values): chưa có. Tên biến môi trường dự kiến nằm trong `IMPLEMENTATION-PLAN.md`.

## Gotchas

Non-obvious things that have surprised people. Save the next agent the debugging.

- Kiểu chữ Display, Heading và Label hiển thị CHỮ HOA. Lưu chữ thường trong mã và dùng CSS `text-transform: uppercase` với `lang="vi"`.
- Không dùng phông Saira Stencil One cho tiếng Việt vì mất dấu mũ khi chồng dấu thanh.
- Cấu hình dự án bảo vệ mọi đường dẫn có chữ `token`, `secret`, `lock`, `migrations`. Đặt tên tệp tự sinh tránh các chữ này (ví dụ `theme.css`, `design-values.json`).
- Thư mục `.private/` nằm ngoài git. Bản tài liệu được git theo dõi nằm ở `docs/design-handoff/`.

## Decisions worth recording

Record a decision only when all three are true: it is hard to reverse, it would surprise a reader who does not know the context, and it came from a real trade-off between options. One line each.

- 2026-10-28: Hướng thiết kế đặt tên "Tần số sinh tồn" - chủ dự án chê tên "Điện đài sinh tồn" là quá kỳ cục.
- 2026-10-29: Giao diện web dùng Bun, React, TypeScript, Zod, Axios và build tĩnh - chủ dự án chọn. Dịch vụ API phía sau chưa chọn.

---

Related: `docs/PRD.md` (intent and focus) and cấu hình dự án (project map, commands,
protected paths). Link `project.context` in cấu hình dự án to this file.
