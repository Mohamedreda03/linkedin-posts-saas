# 📡 Posts API Routes - مرجع كامل

## 🎯 نظرة عامة

هذا الدليل يوثق جميع API endpoints للمنشورات في المشروع.

**Base URL**: `/api/posts`

---

## 📋 القائمة الكاملة

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/posts` | جلب قائمة المنشورات |
| POST | `/api/posts` | إنشاء منشور جديد |
| GET | `/api/posts/:id` | جلب منشور واحد |
| PATCH | `/api/posts/:id` | تحديث منشور |
| DELETE | `/api/posts/:id` | حذف منشور |
| POST | `/api/posts/:id/publish` | نشر منشور |

---

## 1. GET `/api/posts`

جلب قائمة المنشورات مع فلترة وpagination.

### Query Parameters

| Parameter | Type | Required | Default | الوصف |
|-----------|------|----------|---------|-------|
| workspaceId | string | ✅ | - | معرف الـ workspace |
| status | string | ❌ | - | فلترة حسب الحالة |
| limit | number | ❌ | 20 | عدد النتائج (1-100) |
| offset | number | ❌ | 0 | للـ pagination |

### Response

```typescript
{
  posts: Post[],
  total: number,
  limit: number,
  offset: number,
  hasMore: boolean
}
```

### أمثلة

#### جلب جميع المنشورات
```bash
GET /api/posts?workspaceId=workspace123
```

#### جلب المسودات فقط
```bash
GET /api/posts?workspaceId=workspace123&status=draft
```

#### مع pagination
```bash
GET /api/posts?workspaceId=workspace123&limit=10&offset=20
```

### أكواد الاستجابة

| Code | الوصف |
|------|-------|
| 200 | نجاح |
| 400 | معاملات خاطئة |
| 500 | خطأ في الخادم |

---

## 2. POST `/api/posts`

إنشاء منشور جديد.

### Request Body

```typescript
{
  userId: string;           // مطلوب
  workspaceId: string;      // مطلوب
  content: string;          // مطلوب (max: 5000 chars)
  topic: string;            // مطلوب
  tone?: string;            // اختياري
  status?: PostStatus;      // اختياري (default: "draft")
  scheduledAt?: string;     // اختياري (ISO date)
  mediaUrls?: string[];     // اختياري
}
```

### Response

```typescript
{
  post: Post,
  message: string
}
```

### مثال

```javascript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    workspaceId: 'workspace456',
    content: 'محتوى المنشور هنا...',
    topic: 'تسويق رقمي',
    tone: 'professional',
    status: 'draft',
  })
});

const data = await response.json();
console.log(data.post.$id); // معرف المنشور الجديد
```

### Validation

- ✅ `content` لا يتجاوز 5000 حرف
- ✅ `status` قيمة صحيحة (draft|scheduled|publishing|published|failed)
- ✅ `scheduledAt` إذا وُجد، يجب أن يكون في المستقبل

### أكواد الاستجابة

| Code | الوصف |
|------|-------|
| 201 | تم الإنشاء بنجاح |
| 400 | بيانات خاطئة |
| 500 | خطأ في الخادم |

---

## 3. GET `/api/posts/:id`

جلب منشور واحد بالمعرف.

### Path Parameters

| Parameter | Type | الوصف |
|-----------|------|-------|
| id | string | معرف المنشور |

### Response

```typescript
{
  post: Post
}
```

### مثال

```javascript
const response = await fetch('/api/posts/post123');
const data = await response.json();
console.log(data.post);
```

### أكواد الاستجابة

| Code | الوصف |
|------|-------|
| 200 | نجاح |
| 400 | معرف خاطئ |
| 404 | منشور غير موجود |
| 500 | خطأ في الخادم |

---

## 4. PATCH `/api/posts/:id`

تحديث منشور موجود.

### Path Parameters

| Parameter | Type | الوصف |
|-----------|------|-------|
| id | string | معرف المنشور |

### Request Body

جميع الحقول اختيارية:

```typescript
{
  content?: string;
  topic?: string;
  tone?: string;
  status?: PostStatus;
  scheduledAt?: string;
  publishedPlatforms?: PublishedPlatform[];
  errorLog?: string;
  mediaUrls?: string[];
  retryCount?: number;
  lastRetryAt?: string;
}
```

### Response

```typescript
{
  post: Post,
  message: string
}
```

### أمثلة

#### تحديث المحتوى
```javascript
await fetch('/api/posts/post123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: 'محتوى محدث',
  })
});
```

#### تغيير الحالة
```javascript
await fetch('/api/posts/post123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'scheduled',
    scheduledAt: '2025-12-10T10:00:00Z',
  })
});
```

### Validation

- ✅ على الأقل حقل واحد للتحديث
- ✅ نفس validations في POST

### أكواد الاستجابة

| Code | الوصف |
|------|-------|
| 200 | تم التحديث بنجاح |
| 400 | بيانات خاطئة |
| 404 | منشور غير موجود |
| 500 | خطأ في الخادم |

---

## 5. DELETE `/api/posts/:id`

حذف منشور.

### Path Parameters

| Parameter | Type | الوصف |
|-----------|------|-------|
| id | string | معرف المنشور |

### Response

```typescript
{
  message: string
}
```

### مثال

```javascript
await fetch('/api/posts/post123', {
  method: 'DELETE',
});
```

### ملاحظات

- ❌ لا يمكن حذف منشور بحالة `publishing`
- ✅ يمكن حذف المنشورات المنشورة (حذف من DB فقط، ليس من المنصات)

### أكواد الاستجابة

| Code | الوصف |
|------|-------|
| 200 | تم الحذف بنجاح |
| 400 | لا يمكن الحذف (publishing) |
| 404 | منشور غير موجود |
| 500 | خطأ في الخادم |

---

## 6. POST `/api/posts/:id/publish`

نشر منشور على المنصات المحددة.

### Path Parameters

| Parameter | Type | الوصف |
|-----------|------|-------|
| id | string | معرف المنشور |

### Request Body

```typescript
{
  platforms: string[];  // ['linkedin', 'twitter', 'facebook', 'instagram']
  userId: string;       // مطلوب
  workspaceId: string;  // مطلوب
}
```

### Response

```typescript
{
  success: boolean,
  message: string,
  results: PlatformPublishResult[],
  published: number,  // عدد المنصات الناجحة
  failed: number,     // عدد المنصات الفاشلة
  total: number       // إجمالي المنصات
}

interface PlatformPublishResult {
  platform: string,
  success: boolean,
  postId?: string,
  url?: string,
  error?: string
}
```

### مثال

```javascript
const response = await fetch('/api/posts/post123/publish', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platforms: ['linkedin', 'twitter'],
    userId: 'user123',
    workspaceId: 'workspace456',
  })
});

const data = await response.json();
console.log(`Published: ${data.published}/${data.total}`);
console.log(data.results);
```

### سير العمل

```
1. التحقق من وجود المنشور
2. التحقق من الصلاحيات
3. تغيير الحالة إلى "publishing"
4. نشر على كل منصة بشكل متسلسل
5. تحديث publishedPlatforms
6. تحديث الحالة النهائية:
   - "published" إذا نجحت كل المنصات
   - "failed" إذا فشلت كل المنصات
   - "published" (مع errorLog) إذا نجح البعض
```

### أكواد الاستجابة

| Code | الوصف |
|------|-------|
| 200 | اكتمل (حتى لو كان partial success) |
| 400 | بيانات خاطئة |
| 403 | غير مصرح |
| 404 | منشور غير موجود |
| 500 | خطأ في الخادم |

---

## 🔒 الأمان

### التحقق من الصلاحيات

جميع الـ endpoints تتطلب:
- ✅ معرف مستخدم صحيح
- ✅ ملكية المنشور أو الـ workspace
- ✅ حسابات اجتماعية متصلة (للنشر)

### Rate Limiting

يُنصح بإضافة rate limiting لـ:
- POST `/api/posts` - 10 requests/minute
- POST `/api/posts/:id/publish` - 5 requests/minute

---

## 🐛 معالجة الأخطاء

### أخطاء شائعة

#### 400 - Bad Request
```json
{
  "error": "workspaceId is required"
}
```

#### 404 - Not Found
```json
{
  "error": "Post not found"
}
```

#### 500 - Server Error
```json
{
  "error": "Failed to create post"
}
```

### التعامل مع الأخطاء في الكود

```javascript
try {
  const response = await fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const result = await response.json();
  // معالجة النجاح
} catch (error) {
  console.error('Error:', error.message);
  // عرض رسالة للمستخدم
}
```

---

## 📝 أمثلة استخدام كاملة

### إنشاء ونشر منشور

```javascript
// 1. إنشاء مسودة
const createResponse = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    workspaceId: 'workspace456',
    content: 'محتوى رائع!',
    topic: 'تسويق',
  })
});

const { post } = await createResponse.json();

// 2. نشر المنشور
const publishResponse = await fetch(`/api/posts/${post.$id}/publish`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    platforms: ['linkedin', 'twitter'],
    userId: 'user123',
    workspaceId: 'workspace456',
  })
});

const publishResult = await publishResponse.json();
console.log(publishResult);
```

### جدولة منشور

```javascript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    workspaceId: 'workspace456',
    content: 'منشور مجدول',
    topic: 'إعلان',
    status: 'scheduled',
    scheduledAt: '2025-12-15T10:00:00Z',
  })
});
```

---

## 🔗 المراجع

- `docs/api/posts-api.md` - دوال Appwrite
- `docs/architecture/types-interfaces.md` - الـ Types
- `docs/guides/posts-usage.md` - أمثلة عملية

---

**آخر تحديث**: December 9, 2025  
**الإصدار**: 2.0
