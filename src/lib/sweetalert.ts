import Swal from 'sweetalert2';

// Success Alert
export const showSuccess = (message: string, title: string = 'Berhasil!') => {
  return Swal.fire({
    icon: 'success',
    title,
    text: message,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};

// Error Alert
export const showError = (message: string, title: string = 'Terjadi Kesalahan!') => {
  return Swal.fire({
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
  });
};

// Warning Alert
export const showWarning = (message: string, title: string = 'Peringatan!') => {
  return Swal.fire({
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#f39c12',
  });
};

// Info Alert
export const showInfo = (message: string, title: string = 'Informasi') => {
  return Swal.fire({
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
  });
};

// Confirmation Dialog
export const showConfirm = (
  message: string, 
  title: string = 'Konfirmasi',
  confirmText: string = 'Ya',
  cancelText: string = 'Batal'
) => {
  return Swal.fire({
    icon: 'question',
    title,
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    reverseButtons: true,
  });
};

// Loading Alert
export const showLoading = (message: string = 'Memproses...') => {
  return Swal.fire({
    title: message,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

// Toast Notification
export const showToast = (
  message: string, 
  icon: 'success' | 'error' | 'warning' | 'info' = 'success'
) => {
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

// Custom Alert with HTML content
export const showCustomAlert = (
  html: string,
  title: string = '',
  icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info'
) => {
  return Swal.fire({
    icon,
    title,
    html,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3085d6',
  });
};
