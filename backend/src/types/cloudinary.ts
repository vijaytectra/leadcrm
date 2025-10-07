export interface CloudinaryConfig {
  cloud_name: string;
  api_key: string;
  api_secret: string;
  secure: boolean;
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
  version: number;
  signature: string;
  resource_type: string;
  tags: string[];
  context: Record<string, string>;
  metadata: Record<string, any>;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: "image" | "video" | "raw" | "auto";
  transformation?: CloudinaryTransformation[];
  tags?: string[];
  context?: Record<string, string>;
  quality?: string | number;
  format?: string;
  eager?: CloudinaryTransformation[];
  eager_async?: boolean;
  eager_notification_url?: string;
  categorization?: string;
  auto_tagging?: number;
  background_removal?: string;
  detection?: string;
  similarity_search?: boolean;
  ocr?: string;
  raw_convert?: string;
  allowed_formats?: string[];
  disallowed_formats?: string[];
  moderation?: string;
  access_mode?: "public" | "authenticated";
  type?: "upload" | "private" | "authenticated";
  callback?: string;
  eager_eval?: string;
  use_filename?: boolean;
  unique_filename?: boolean;
  discard_original_filename?: boolean;
  notification_url?: string;
  eager_transformation?: CloudinaryTransformation[];
  responsive_breakpoints?: {
    create_derived?: boolean;
    bytes_step?: number;
    min_width?: number;
    max_width?: number;
    max_images?: number;
  };
  upload_preset?: string;
  phash?: boolean;
  return_delete_token?: boolean;
  invalidate?: boolean;
  use_filename_as_display_name?: boolean;
  display_name?: string;
  unique_display_name?: boolean;
}

export interface CloudinaryTransformation {
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
  quality?: string | number;
  format?: string;
  fetch_format?: string;
  flags?: string;
  dpr?: number;
  angle?: number;
  opacity?: number;
  border?: string;
  background?: string;
  overlay?: string;
  underlay?: string;
  effect?: string;
  radius?: number;
  color?: string;
  color_space?: string;
  prefix?: string;
  suffix?: string;
  transformation?: CloudinaryTransformation[];
  if?: string;
  else?: string;
  end_if?: boolean;
  variables?: string[];
  if_?: string;
  custom_function?: {
    function_type: string;
    source: string;
  };
  zoom?: number;

  c?: string;
  g?: string;
  q?: string | number;
  f?: string;

  a?: number;
  b?: string;
  bo?: string;
  e?: string;

  ar?: string;
  cs?: string;
  dl?: string;
  dn?: string;
  du?: string;
  dx?: number;
  dy?: number;
  eo?: number;
  fl?: string;
  h?: number;
  l?: string;
  o?: number;
  p?: string;
  r?: number;
  t?: string[];
  u?: string;
  w?: number;
  x?: number;
  y?: number;
  z?: number;
}

export interface CloudinaryResource {
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width: number;
  height: number;
  url: string;
  secure_url: string;
  access_mode: string;
  context?: Record<string, string>;
  tags?: string[];
  folder?: string;
  original_filename?: string;
  eager?: CloudinaryTransformation[];
  derived?: CloudinaryTransformation[];
}

export interface CloudinaryListResult {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count?: number;
}

export interface CloudinaryDeleteResult {
  result: string;
  deleted?: Record<string, string>;
  partial?: boolean;
  deleted_count?: number;
  not_found?: string[];
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloud_name: string;
  api_key: string;
}

export interface AssetUploadRequest {
  file: any; // Multer file object
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  public_id?: string;
}

export interface AssetUploadResponse {
  success: boolean;
  data?: {
    id: string;
    public_id: string;
    secure_url: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    created_at: string;
    responsive_urls: {
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      original: string;
    };
  };
  error?: string;
}

export interface AssetDeleteRequest {
  public_id: string;
}

export interface AssetDeleteResponse {
  success: boolean;
  data?: {
    deleted: boolean;
    public_id: string;
  };
  error?: string;
}

export interface AssetListRequest {
  folder?: string;
  tags?: string[];
  max_results?: number;
  next_cursor?: string;
}

export interface AssetListResponse {
  success: boolean;
  data?: {
    resources: CloudinaryResource[];
    next_cursor?: string;
    total_count?: number;
  };
  error?: string;
}
