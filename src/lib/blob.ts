import { Bucket } from "@upstash/blob";

// Shared Upstash Blob client — null when env not configured (local dev fallback).
// Bucket visibility is a console setting: ours is PRIVATE, so objects have no
// public URL — reads go through signedReadUrl() (see /api/admin/files).
// The token is a bearer secret for the whole bucket: server-side only, never NEXT_PUBLIC_.
export const blob = process.env.UPSTASH_BLOB_TOKEN
  ? new Bucket({ token: process.env.UPSTASH_BLOB_TOKEN })
  : null;
