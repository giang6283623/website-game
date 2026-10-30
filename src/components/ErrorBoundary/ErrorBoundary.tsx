import { Component, type ReactNode } from "react";
import { ServerError } from "../../pages/ServerError.tsx";

type Props = {
  children: ReactNode;
  /** Đổi giá trị này (ví dụ địa chỉ trang) thì thoát khỏi trạng thái lỗi. */
  resetKey?: string;
  /** Gọi trước khi vẽ lại sau nút THỬ LẠI (ví dụ tạo lại các trang nạp lười bị lỗi mạng). */
  onReset?: () => void;
};

type State = { failed: boolean; key?: string };

/**
 * Bắt lỗi khi vẽ trang và hiện trang 500 thay vì màn hình trắng. Không in chi tiết kỹ thuật ra giao diện.
 * Nút THỬ LẠI vẽ lại phần nội dung. Đổi trang bằng liên kết cũng thoát khỏi trạng thái lỗi.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false, key: this.props.resetKey };

  static getDerivedStateFromError(): Partial<State> {
    return { failed: true };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { failed: false, key: props.resetKey } : null;
  }

  override componentDidCatch(error: unknown): void {
    // Chi tiết chỉ ghi vào bảng điều khiển của nhà phát triển, không hiện cho người chơi.
    console.error("Lỗi khi vẽ trang:", error);
  }

  private retry = () => {
    this.props.onReset?.();
    this.setState({ failed: false });
  };

  override render() {
    return this.state.failed ? <ServerError onRetry={this.retry} /> : this.props.children;
  }
}
