export type WidgetThemePreset =
  | "modern-light"
  | "modern-dark"
  | "minimal-light"
  | "minimal-dark"
  | "classic-light"
  | "classic-dark";

export interface WidgetTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  buttonColor: string;
  buttonTextColor: string;
  inputBackgroundColor: string;
  inputBorderColor: string;
  labelColor: string;
  errorColor: string;
  successColor: string;
}

export const WIDGET_THEMES: Record<WidgetThemePreset, WidgetTheme> = {
  "modern-light": {
    primaryColor: "#3b82f6",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    borderColor: "#e5e7eb",
    borderRadius: 12,
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 16,
    buttonColor: "#3b82f6",
    buttonTextColor: "#ffffff",
    inputBackgroundColor: "#ffffff",
    inputBorderColor: "#d1d5db",
    labelColor: "#374151",
    errorColor: "#ef4444",
    successColor: "#10b981",
  },
  "modern-dark": {
    primaryColor: "#60a5fa",
    backgroundColor: "#1f2937",
    textColor: "#f9fafb",
    borderColor: "#374151",
    borderRadius: 12,
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 16,
    buttonColor: "#60a5fa",
    buttonTextColor: "#1f2937",
    inputBackgroundColor: "#374151",
    inputBorderColor: "#4b5563",
    labelColor: "#d1d5db",
    errorColor: "#f87171",
    successColor: "#34d399",
  },
  "minimal-light": {
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    borderColor: "#000000",
    borderRadius: 0,
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: 14,
    buttonColor: "#000000",
    buttonTextColor: "#ffffff",
    inputBackgroundColor: "#ffffff",
    inputBorderColor: "#000000",
    labelColor: "#000000",
    errorColor: "#dc2626",
    successColor: "#059669",
  },
  "minimal-dark": {
    primaryColor: "#ffffff",
    backgroundColor: "#000000",
    textColor: "#ffffff",
    borderColor: "#ffffff",
    borderRadius: 0,
    fontFamily: "Helvetica, Arial, sans-serif",
    fontSize: 14,
    buttonColor: "#ffffff",
    buttonTextColor: "#000000",
    inputBackgroundColor: "#000000",
    inputBorderColor: "#ffffff",
    labelColor: "#ffffff",
    errorColor: "#fca5a5",
    successColor: "#6ee7b7",
  },
  "classic-light": {
    primaryColor: "#1e40af",
    backgroundColor: "#f8fafc",
    textColor: "#1e293b",
    borderColor: "#cbd5e1",
    borderRadius: 4,
    fontFamily: "Georgia, serif",
    fontSize: 15,
    buttonColor: "#1e40af",
    buttonTextColor: "#ffffff",
    inputBackgroundColor: "#ffffff",
    inputBorderColor: "#94a3b8",
    labelColor: "#334155",
    errorColor: "#dc2626",
    successColor: "#059669",
  },
  "classic-dark": {
    primaryColor: "#60a5fa",
    backgroundColor: "#0f172a",
    textColor: "#f1f5f9",
    borderColor: "#334155",
    borderRadius: 4,
    fontFamily: "Georgia, serif",
    fontSize: 15,
    buttonColor: "#60a5fa",
    buttonTextColor: "#0f172a",
    inputBackgroundColor: "#1e293b",
    inputBorderColor: "#475569",
    labelColor: "#cbd5e1",
    errorColor: "#f87171",
    successColor: "#34d399",
  },
};

export const THEME_PRESETS = [
  {
    id: "modern-light" as WidgetThemePreset,
    name: "Modern Light",
    description: "Clean and contemporary with light colors",
    preview: {
      primaryColor: "#3b82f6",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
    },
  },
  {
    id: "modern-dark" as WidgetThemePreset,
    name: "Modern Dark",
    description: "Sleek dark theme with blue accents",
    preview: {
      primaryColor: "#60a5fa",
      backgroundColor: "#1f2937",
      textColor: "#f9fafb",
    },
  },
  {
    id: "minimal-light" as WidgetThemePreset,
    name: "Minimal Light",
    description: "Ultra-clean with black and white",
    preview: {
      primaryColor: "#000000",
      backgroundColor: "#ffffff",
      textColor: "#000000",
    },
  },
  {
    id: "minimal-dark" as WidgetThemePreset,
    name: "Minimal Dark",
    description: "Pure dark with white accents",
    preview: {
      primaryColor: "#ffffff",
      backgroundColor: "#000000",
      textColor: "#ffffff",
    },
  },
  {
    id: "classic-light" as WidgetThemePreset,
    name: "Classic Light",
    description: "Traditional with serif fonts",
    preview: {
      primaryColor: "#1e40af",
      backgroundColor: "#f8fafc",
      textColor: "#1e293b",
    },
  },
  {
    id: "classic-dark" as WidgetThemePreset,
    name: "Classic Dark",
    description: "Elegant dark with serif fonts",
    preview: {
      primaryColor: "#60a5fa",
      backgroundColor: "#0f172a",
      textColor: "#f1f5f9",
    },
  },
];

export function getThemeStyles(preset: WidgetThemePreset): WidgetTheme {
  return WIDGET_THEMES[preset];
}

export function generateThemeCSS(theme: WidgetTheme): string {
  return `
    .widget-form {
      font-family: ${theme.fontFamily};
      font-size: ${theme.fontSize}px;
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
      border-radius: ${theme.borderRadius}px;
    }
    
    .widget-form .form-field {
      margin-bottom: 1rem;
    }
    
    .widget-form .form-label {
      color: ${theme.labelColor};
      font-weight: 500;
      margin-bottom: 0.5rem;
      display: block;
    }
    
    .widget-form .form-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid ${theme.inputBorderColor};
      border-radius: ${theme.borderRadius}px;
      background-color: ${theme.inputBackgroundColor};
      color: ${theme.textColor};
      font-size: ${theme.fontSize}px;
      font-family: ${theme.fontFamily};
    }
    
    .widget-form .form-input:focus {
      outline: none;
      border-color: ${theme.primaryColor};
      box-shadow: 0 0 0 2px ${theme.primaryColor}20;
    }
    
    .widget-form .form-button {
      background-color: ${theme.buttonColor};
      color: ${theme.buttonTextColor};
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: ${theme.borderRadius}px;
      font-size: ${theme.fontSize}px;
      font-family: ${theme.fontFamily};
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .widget-form .form-button:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }
    
    .widget-form .form-error {
      color: ${theme.errorColor};
      font-size: ${theme.fontSize - 2}px;
      margin-top: 0.25rem;
    }
    
    .widget-form .form-success {
      color: ${theme.successColor};
      font-size: ${theme.fontSize - 2}px;
      margin-top: 0.25rem;
    }
    
    .widget-form .form-required {
      color: ${theme.errorColor};
    }
    
    .widget-form .form-select {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid ${theme.inputBorderColor};
      border-radius: ${theme.borderRadius}px;
      background-color: ${theme.inputBackgroundColor};
      color: ${theme.textColor};
      font-size: ${theme.fontSize}px;
      font-family: ${theme.fontFamily};
    }
    
    .widget-form .form-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid ${theme.inputBorderColor};
      border-radius: ${theme.borderRadius}px;
      background-color: ${theme.inputBackgroundColor};
      color: ${theme.textColor};
      font-size: ${theme.fontSize}px;
      font-family: ${theme.fontFamily};
      resize: vertical;
      min-height: 100px;
    }
    
    .widget-form .form-checkbox,
    .widget-form .form-radio {
      margin-right: 0.5rem;
      accent-color: ${theme.primaryColor};
    }
    
    .widget-form .form-checkbox-label,
    .widget-form .form-radio-label {
      color: ${theme.labelColor};
      font-size: ${theme.fontSize}px;
      cursor: pointer;
    }
  `;
}

export function getThemePreviewStyles(
  preset: WidgetThemePreset
): React.CSSProperties {
  const theme = getThemeStyles(preset);

  return {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    borderColor: theme.borderColor,
    borderRadius: `${theme.borderRadius}px`,
    fontFamily: theme.fontFamily,
    fontSize: `${theme.fontSize}px`,
  };
}
