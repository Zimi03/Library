import { toast, ToastPosition, Theme } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "success" | "error" | "info" | "warning";

function notification(pos: ToastPosition, text: string, type: ToastType, theme: Theme) {
  toast[type](text, {
    position: pos,
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: theme,
  });
}

export default notification;
