export const normalizeStadiumFromField = (field: any): { id: number; name: string } | null => {
  if (field?.Stadion) {
    return {
      id: field.Stadion.id,
      name: field.Stadion.name
    }
  }
  
  if (field?.stadion) {
    return {
      id: field.stadion.id,
      name: field.stadion.name
    }
  }
  
  return null
}

export const getStadiumName = (field: any): string => {
  const stadium = normalizeStadiumFromField(field)
  return stadium?.name || 'Tidak ada stadion'
}

export const getStadiumId = (field: any): number | null => {
  const stadium = normalizeStadiumFromField(field)
  return stadium?.id || null
}

export const normalizeFieldsArray = <T extends Record<string, any>>(fields: T[]): T[] => {
  return fields.map(field => {
    if (field.Stadion) {
      return field
    }
    
    if (field.stadion) {
      return {
        ...field,
        Stadion: field.stadion
      }
    }
    
    return field
  })
}

export const safeGet = <T = any>(
  obj: any, 
  path: string, 
  defaultValue: T | null = null
): T | null => {
  try {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result == null) return defaultValue
      result = result[key]
    }
    
    return result ?? defaultValue
  } catch {
    return defaultValue
  }
}
