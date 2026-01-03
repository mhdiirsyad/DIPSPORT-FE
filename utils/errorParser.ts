interface ParsedError {
  message: string
  title?: string
  isUserFriendly: boolean
}

function parsePrismaUniqueConstraint(error: string): ParsedError | null {
  if (error.includes('Unique constraint failed') && error.includes('BookingDetail')) {
    return {
      title: 'Slot Tidak Tersedia',
      message: 'Slot waktu yang dipilih sudah dibooking oleh pengguna lain. Silakan pilih slot yang berbeda atau coba lagi.',
      isUserFriendly: true
    }
  }
  
  if (error.includes('Unique constraint failed')) {
    return {
      title: 'Data Sudah Ada',
      message: 'Data dengan informasi tersebut sudah ada di sistem. Silakan periksa kembali.',
      isUserFriendly: true
    }
  }
  
  return null
}

function parsePrismaForeignKey(error: string): ParsedError | null {
  if (error.includes('Foreign key constraint')) {
    return {
      title: 'Data Tidak Valid',
      message: 'Data yang Anda pilih tidak valid atau sudah tidak tersedia. Silakan refresh halaman dan coba lagi.',
      isUserFriendly: true
    }
  }
  
  return null
}

function parsePrismaNotFound(error: string): ParsedError | null {
  if (error.includes('Record to update not found') || error.includes('Record to delete not found')) {
    return {
      title: 'Data Tidak Ditemukan',
      message: 'Data yang Anda cari sudah tidak ada atau telah dihapus.',
      isUserFriendly: true
    }
  }
  
  return null
}

function parseAuthError(error: string): ParsedError | null {
  if (error.includes('Invalid email or password')) {
    return {
      title: 'Login Gagal',
      message: 'Email atau password yang Anda masukkan salah. Silakan periksa kembali.',
      isUserFriendly: true
    }
  }
  
  if (error.includes('Unauthorized') || error.includes('unauthorized')) {
    return {
      title: 'Akses Ditolak',
      message: 'Sesi Anda telah berakhir. Silakan login kembali.',
      isUserFriendly: true
    }
  }
  
  if (error.includes('Token expired') || error.includes('jwt expired')) {
    return {
      title: 'Sesi Berakhir',
      message: 'Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.',
      isUserFriendly: true
    }
  }
  
  return null
}

function parseValidationError(error: string): ParsedError | null {
  if (error.includes('validation') || error.includes('invalid')) {
    return {
      title: 'Data Tidak Valid',
      message: 'Data yang Anda masukkan tidak sesuai format. Silakan periksa kembali.',
      isUserFriendly: true
    }
  }
  
  return null
}

function parseNetworkError(error: string): ParsedError | null {
  if (error.includes('timeout') || error.includes('ECONNREFUSED') || error.includes('Network error')) {
    return {
      title: 'Koneksi Bermasalah',
      message: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda atau coba beberapa saat lagi.',
      isUserFriendly: true
    }
  }
  
  if (error.includes('502') || error.includes('Bad Gateway')) {
    return {
      title: 'Server Tidak Tersedia',
      message: 'Server sedang mengalami gangguan. Mohon coba beberapa saat lagi.',
      isUserFriendly: true
    }
  }
  
  return null
}

export function parseBackendError(error: any): ParsedError {
  let errorMessage = ''
  
  if (typeof error === 'string') {
    errorMessage = error
  } else if (error?.message) {
    errorMessage = error.message
  } else if (error?.statusMessage) {
    errorMessage = error.statusMessage
  } else if (error?.data?.statusMessage) {
    errorMessage = error.data.statusMessage
  } else if (error?.data?.message) {
    errorMessage = error.data.message
  }
  
  const parsers = [
    parsePrismaUniqueConstraint,
    parsePrismaForeignKey,
    parsePrismaNotFound,
    parseAuthError,
    parseValidationError,
    parseNetworkError,
  ]
  
  for (const parser of parsers) {
    const parsed = parser(errorMessage)
    if (parsed) return parsed
  }
  
  const cleanMessage = errorMessage
    .replace(/\[POST\]\s*"[^"]+"\s*:\s*\d+\s*/g, '') 
    .replace(/Invalid `prisma\.[^`]+` invocation[^]*?(?=\n|$)/gi, '')
    .replace(/in\/app\/src\/[^\s]+/g, '')
    .replace(/Unique constraint failed on the constraint: `[^`]+`/gi, 'Data sudah ada atau tidak valid')
    .trim()
  
  if (!cleanMessage || cleanMessage.length < 5 || cleanMessage.includes('prisma') || cleanMessage.includes('resolver')) {
    return {
      title: 'Terjadi Kesalahan',
      message: 'Mohon maaf, terjadi kesalahan pada sistem. Silakan coba lagi atau hubungi administrator jika masalah berlanjut.',
      isUserFriendly: true
    }
  }
  
  return {
    message: cleanMessage,
    isUserFriendly: false
  }
}

export function getUserFriendlyError(error: any): string {
  const parsed = parseBackendError(error)
  
  if (parsed.title) {
    return `${parsed.title}: ${parsed.message}`
  }
  
  return parsed.message
}
