/**
 * TypeScript definitions for Cloudinary API responses
 */

export interface CloudinaryResource {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  access_mode?: string;
  context?: Record<string, string>;
  metadata?: Record<string, string>;
}

export interface CloudinaryResourcesResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  rate_limit_allowed: number;
  rate_limit_reset_at: string;
  rate_limit_remaining: number;
}

export interface CloudinaryUsageResponse {
  plan: string;
  last_updated: string;
  objects: {
    usage: number;
    limit: number;
  };
  bandwidth: {
    usage: number;
    limit: number;
  };
  storage: {
    usage: number;
    limit: number;
  };
  requests: number;
  resources: number;
  derived_resources: number;
  transformations: number;
  credits?: number;
  used_percent: number;
}

export interface CloudinaryAccountResponse {
  account: {
    cloud_name: string;
    used_percent: number;
  };
}

export interface CloudinaryApiError {
  message: string;
  http_code: number;
}

export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename: string;
}

export interface CloudinaryDeleteResponse {
  deleted: Record<string, string>;
  deleted_counts: {
    [key: string]: number;
  };
  partial: boolean;
  rate_limit_allowed: number;
  rate_limit_reset_at: string;
  rate_limit_remaining: number;
}

export interface CloudinaryTransformationOptions {
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'limit' | 'mfit' | 'fill' | 'lfill' | 'pad' | 'lpad' | 'mpad' | 'crop' | 'thumb' | 'imagga_crop' | 'imagga_scale';
  gravity?: 'auto' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west' | 'face' | 'faces';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  fetch_format?: 'auto' | 'webp' | 'avif' | 'jp2' | 'wdp' | 'png' | 'jpg' | 'gif';
  flags?: 'progressive' | 'immutable_cache' | 'keep_iptc' | 'attachment' | 'relative' | 'region_relative' | 'layer_apply' | 'no_overflow' | 'tiled' | 'ignore_aspect_ratio';
  secure?: boolean;
  sign_url?: boolean;
}

export interface CloudinaryUrlOptions extends CloudinaryTransformationOptions {
  version?: number;
  format?: string;
  auth_token?: string;
}
