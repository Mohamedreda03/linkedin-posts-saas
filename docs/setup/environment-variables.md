# 🌍 Environment Variables - دليل المتغيرات

## 📋 المتغيرات المطلوبة

### ملف: `.env.local`

```env
# ============================================================
# APPWRITE CONFIGURATION
# ============================================================

# Appwrite Endpoint (عادة cloud.appwrite.io)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1

# معرف المشروع من Appwrite Console
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id-here

# API Key من Appwrite (للعمليات من جانب الخادم)
APPWRITE_API_KEY=your-api-key-here

# ============================================================
# DATABASE IDs
# ============================================================

# معرف قاعدة البيانات
NEXT_PUBLIC_APPWRITE_DATABASE_ID=linkedin-saas

# معرفات الـ Collections
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POSTS=posts
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS=social_accounts
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACES=workspaces
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACE_ACCOUNTS=workspace_accounts

# معرف الـ Storage Bucket (للوسائط - المرحلة 6)
NEXT_PUBLIC_APPWRITE_MEDIA_BUCKET_ID=post-media

# ============================================================
# OAUTH CREDENTIALS
# ============================================================

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Twitter/X OAuth
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret

# Instagram (يستخدم Facebook credentials)
# Instagram API يعمل من خلال Facebook Graph API

# ============================================================
# SECURITY
# ============================================================

# سر للتحقق من Cron Jobs (المرحلة 4)
CRON_SECRET=your-random-secret-string-here

# NextAuth Secret (إذا استخدمت NextAuth)
NEXTAUTH_SECRET=your-nextauth-secret

# ============================================================
# OPTIONAL - للتطوير
# ============================================================

# URL الأساسي للموقع
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

---

## 🔑 كيفية الحصول على المفاتيح

### 1. Appwrite
1. اذهب إلى https://cloud.appwrite.io/console
2. اختر مشروعك
3. من **Settings** → نسخ Project ID
4. من **API Keys** → إنشاء API Key جديد مع صلاحيات كاملة

### 2. LinkedIn OAuth
1. اذهب إلى https://www.linkedin.com/developers/apps
2. أنشئ تطبيق جديد
3. من **Auth** tab → نسخ Client ID & Client Secret
4. أضف Redirect URL: `https://yourapp.com/api/auth/callback/linkedin`
5. اطلب الصلاحيات: `openid`, `profile`, `email`, `w_member_social`

### 3. Twitter/X OAuth
1. اذهب إلى https://developer.twitter.com/en/portal/dashboard
2. أنشئ مشروع وتطبيق جديد
3. من **Keys and tokens** → نسخ API Key & API Secret
4. فعّل OAuth 2.0
5. أضف Callback URL: `https://yourapp.com/api/auth/callback/twitter`

### 4. Facebook OAuth
1. اذهب إلى https://developers.facebook.com/apps
2. أنشئ تطبيق جديد (نوع: Business)
3. أضف **Facebook Login** product
4. من **Settings** → نسخ App ID & App Secret
5. أضف Redirect URI: `https://yourapp.com/api/auth/callback/facebook`

### 5. Instagram
Instagram يعمل من خلال Facebook API، استخدم نفس credentials.

---

## ⚠️ ملاحظات الأمان

### ❌ لا تفعل:
- ❌ لا ترفع `.env.local` إلى Git
- ❌ لا تشارك API Keys مع أحد
- ❌ لا تكتب Secrets في الكود مباشرة

### ✅ افعل:
- ✅ أضف `.env.local` إلى `.gitignore`
- ✅ استخدم متغيرات البيئة في Vercel/Production
- ✅ غيّر Secrets بشكل دوري
- ✅ استخدم `NEXT_PUBLIC_` فقط للقيم العامة

---

## 📝 ملف `.env.example`

أنشئ ملف `.env.example` في الجذر:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=

# Database
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POSTS=
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS=
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACES=
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACE_ACCOUNTS=

# OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Security
CRON_SECRET=
NEXTAUTH_SECRET=
```

---

## 🚀 الإعداد في Production (Vercel)

1. اذهب إلى Vercel Dashboard
2. اختر مشروعك
3. Settings → Environment Variables
4. أضف جميع المتغيرات
5. اختر Environment: Production, Preview, Development

---

## ✅ التحقق من الإعداد

```javascript
// في أي ملف، جرب:
console.log({
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
});
```

إذا رأيت `undefined`، تأكد من:
1. اسم الملف هو `.env.local` (وليس `.env`)
2. أعد تشغيل dev server
3. المتغير يبدأ بـ `NEXT_PUBLIC_` (للـ client-side)

---

**آخر تحديث**: December 9, 2025
