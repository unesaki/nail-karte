// ============================================================
// NailKarte — 全型定義
// ============================================================

// ----------------------------------------------------------------
// Owner（ネイリスト・サロンオーナー）
// ----------------------------------------------------------------
export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'

export interface Owner {
  id: string
  email: string
  name: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  subscription_status: SubscriptionStatus | null
  trial_end: string | null
  line_channel_access_token: string | null
  line_channel_secret: string | null
  google_access_token: string | null
  google_refresh_token: string | null
  google_token_expiry: string | null
  google_calendar_id: string | null
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// Customer（顧客）
// ----------------------------------------------------------------
export type NailShape = 'round' | 'square' | 'oval' | 'point' | 'squareoff'
export type NailLength = 'short' | 'medium' | 'long'

export interface Customer {
  id: string
  owner_id: string
  name: string
  phone: string | null
  nail_shape: NailShape | null
  nail_length: NailLength | null
  allergy_info: string | null
  line_user_id: string | null
  memo: string | null
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// Treatment（カルテ）
// ----------------------------------------------------------------
export interface Treatment {
  id: string
  owner_id: string
  customer_id: string
  treatment_date: string
  menu_name: string
  price: number
  color_memo: string | null
  design_memo: string | null
  photo_urls: string[]
  next_visit_date: string | null
  is_quick_entry: boolean
  google_event_id: string | null
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// MenuPreset（メニュープリセット）
// ----------------------------------------------------------------
export interface MenuPreset {
  id: string
  owner_id: string
  name: string
  price: number
  sort_order: number
  created_at: string
  updated_at: string
}

// ----------------------------------------------------------------
// UI用の拡張型
// ----------------------------------------------------------------
export interface CustomerWithLatestTreatment extends Customer {
  latest_treatment?: Pick<Treatment, 'treatment_date' | 'menu_name' | 'next_visit_date'>
  treatment_count?: number
}

export interface TreatmentWithCustomer extends Treatment {
  customer: Pick<Customer, 'id' | 'name' | 'allergy_info'>
}

// ----------------------------------------------------------------
// フォーム用型
// ----------------------------------------------------------------
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterStep1Form {
  email: string
  password: string
  password_confirm: string
}

export interface RegisterStep2Form {
  name: string
}

export interface CustomerForm {
  name: string
  phone: string
  nail_shape: NailShape | ''
  nail_length: NailLength | ''
  allergy_info: string
  memo: string
}

export interface QuickTreatmentForm {
  menu_preset_id: string | null
  menu_name: string
  price: number | ''
  color_memo: string
  photo_file: File | null
  next_visit_date: string
}

export interface TreatmentForm {
  treatment_date: string
  menu_preset_id: string | null
  menu_name: string
  price: number | ''
  color_memo: string
  design_memo: string
  photo_files: File[]
  next_visit_date: string
}

// ----------------------------------------------------------------
// API レスポンス型
// ----------------------------------------------------------------
export interface ApiResponse<T = void> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
}

// ----------------------------------------------------------------
// ダッシュボード統計型
// ----------------------------------------------------------------
export interface DashboardStats {
  monthly_revenue: number
  monthly_treatment_count: number
  total_customers: number
  upcoming_visits: CustomerWithLatestTreatment[]
}

// ----------------------------------------------------------------
// Stripe Webhook イベント型
// ----------------------------------------------------------------
export type StripeWebhookEvent =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'
