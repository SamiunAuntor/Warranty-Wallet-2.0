import Swal, { type SweetAlertIcon } from "sweetalert2";

const brandColor = "#4b41e1";

const toastInstance = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  showClass: { popup: "swal2-show" },
  hideClass: { popup: "swal2-hide" },
});

function showToast(icon: SweetAlertIcon, title: string) {
  return toastInstance.fire({ icon, title });
}

function showDialog(icon: SweetAlertIcon, title: string, text?: string) {
  return Swal.fire({
    icon,
    title,
    text,
    confirmButtonColor: brandColor,
    confirmButtonText: "Okay",
  });
}

export const toast = {
  success: (message: string) => showToast("success", message),
  error: (message: string) => showToast("error", message),
  info: (message: string) => showToast("info", message),
  warning: (message: string) => showToast("warning", message),
};

export const dialog = {
  success: (title: string, message?: string) => showDialog("success", title, message),
  error: (title: string, message?: string) => showDialog("error", title, message),
  info: (title: string, message?: string) => showDialog("info", title, message),
  warning: (title: string, message?: string) => showDialog("warning", title, message),
  confirm: (title: string, message?: string) => Swal.fire({
    icon: "question",
    title,
    text: message,
    showCancelButton: true,
    confirmButtonColor: brandColor,
    confirmButtonText: "Confirm",
  }),
};
