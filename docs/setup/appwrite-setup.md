# 📝 إعداد Appwrite Database - دليل كامل

## 🎯 نظرة عامة

هذا الدليل يوضح خطوات إعداد قاعدة البيانات في Appwrite لمشروع LinkedIn Automation SaaS.

---

## ⚡ الإعداد التلقائي (الموصى به)

### استخدام Script الإعداد

```bash
node scripts/init-db.js
```

هذا الـ script سيقوم بـ:
- ✅ إنشاء Database إذا لم تكن موجودة
- ✅ إنشاء جميع الـ Collections
- ✅ إضافة جميع الـ Attributes
- ✅ إنشاء جميع الـ Indexes

---

## 📊 تصميم قاعدة البيانات

### 1. Posts Collection

#### الحقول الأساسية:
| الحقل | النوع | الحجم | مطلوب | الافتراضي | الوصف |
|-------|-------|-------|-------|-----------|-------|
| userId | string | 36 | ✅ | - | معرف المستخدم |
| workspaceId | string | 36 | ❌ | - | معرف الـ workspace |
| content | string | 5000 | ✅ | - | محتوى المنشور |
| topic | string | 255 | ✅ | - | الموضوع |
| tone | string | 50 | ❌ | - | النبرة |

#### حقول النشر:
| الحقل | النوع | الحجم | مطلوب | الافتراضي | الوصف |
|-------|-------|-------|-------|-----------|-------|
| status | string | 20 | ❌ | "draft" | draft\|scheduled\|publishing\|published\|failed |
| scheduledAt | string | 50 | ❌ | - | تاريخ الجدولة ISO |
| publishedPlatforms | string | 2000 | ❌ | "[]" | JSON array للمنصات المنشور عليها |
| errorLog | string | 2000 | ❌ | - | تفاصيل الأخطاء |
| mediaUrls | string | 2000 | ❌ | "[]" | روابط الوسائط |
| retryCount | integer | - | ❌ | 0 | عدد محاولات إعادة النشر |
| lastRetryAt | string | 50 | ❌ | - | آخر محاولة إعادة |

#### حقول التوافق القديمة:
| الحقل | النوع | الحجم | مطلوب | الافتراضي | الوصف |
|-------|-------|-------|-------|-----------|-------|
| isPublished | boolean | - | ❌ | false | هل تم النشر؟ |
| publishedTo | string | 50 | ❌ | - | اسم المنصة |
| publishedAt | string | 50 | ❌ | - | تاريخ النشر |

#### الـ Indexes:
1. **userId_index** - فهرسة حسب المستخدم
2. **workspaceId_index** - فهرسة حسب workspace
3. **status_idx** - فهرسة حسب الحالة
4. **scheduledAt_idx** - فهرسة حسب تاريخ الجدولة
5. **workspace_status_idx** (composite) - workspaceId + status
6. **user_status_idx** (composite) - userId + status
7. **search_index** (fulltext) - للبحث في content و topic

---

### 2. Social Accounts Collection

| الحقل | النوع | الحجم | مطلوب | الوصف |
|-------|-------|-------|-------|-------|
| userId | string | 36 | ✅ | معرف المالك |
| platform | string | 50 | ✅ | linkedin\|twitter\|facebook\|instagram |
| platformUserId | string | 255 | ✅ | معرف المستخدم على المنصة |
| accessToken | string | 2000 | ✅ | OAuth access token |
| refreshToken | string | 2000 | ❌ | OAuth refresh token |
| tokenExpiry | string | 50 | ❌ | تاريخ انتهاء التوكن |
| accountName | string | 255 | ✅ | اسم العرض |
| accountEmail | string | 255 | ❌ | البريد الإلكتروني |
| accountImage | string | 500 | ❌ | رابط صورة الملف الشخصي |

#### الـ Indexes:
1. **userId_index**
2. **platform_index**
3. **platformUserId_platform_index** (composite)

---

### 3. Workspaces Collection

| الحقل | النوع | الحجم | مطلوب | الوصف |
|-------|-------|-------|-------|-------|
| name | string | 100 | ✅ | اسم الـ workspace |
| slug | string | 100 | ✅ | معرف فريد (URL-friendly) |
| ownerId | string | 36 | ✅ | معرف المالك |
| icon | string | 50 | ❌ | رمز تعبيري |
| color | string | 20 | ❌ | لون hex |

#### الـ Indexes:
1. **ownerId_index**
2. **slug_index** (unique)

---

### 4. Workspace Accounts Collection (Junction Table)

جدول وسيط لربط الـ workspaces بالـ social accounts (علاقة many-to-many).

| الحقل | النوع | الحجم | مطلوب | الوصف |
|-------|-------|-------|-------|-------|
| workspaceId | string | 36 | ✅ | معرف الـ workspace |
| socialAccountId | string | 36 | ✅ | معرف الحساب الاجتماعي |
| userId | string | 36 | ✅ | للتحكم في الصلاحيات |

#### الـ Indexes:
1. **workspaceId_index**
2. **socialAccountId_index**
3. **userId_index**
4. **workspace_account_unique** (unique composite)

---

## 🔧 الإعداد اليدوي (إذا لزم الأمر)

### الخطوة 1: فتح Appwrite Console
1. اذهب إلى https://cloud.appwrite.io/console
2. سجل دخول إلى حسابك
3. اختر مشروعك

### الخطوة 2: إنشاء Database
1. من القائمة الجانبية، اختر **"Databases"**
2. اضغط **"Create Database"**
3. اسم الـ Database: `linkedin-saas` (أو ما هو محدد في .env)

### الخطوة 3: إنشاء Collections
اتبع التصميم أعلاه لإنشاء كل collection مع جميع attributes و indexes.

---

## 🔐 الصلاحيات (Permissions)

### Posts Collection:
```javascript
[
  Permission.create(Role.users()),
  Permission.read(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
]
```

نفس الصلاحيات لجميع الـ collections الأخرى.

---

## 🌍 Environment Variables المطلوبة

تأكد من وجود هذه المتغيرات في `.env.local`:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

NEXT_PUBLIC_APPWRITE_DATABASE_ID=linkedin-saas
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_POSTS=posts
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_SOCIAL_ACCOUNTS=social_accounts
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACES=workspaces
NEXT_PUBLIC_APPWRITE_COLLECTION_ID_WORKSPACE_ACCOUNTS=workspace_accounts
```

---

## ✅ التحقق من الإعداد

بعد تشغيل الـ script، تحقق من:

1. ✅ Database `linkedin-saas` موجودة
2. ✅ 4 Collections تم إنشاؤها
3. ✅ جميع Attributes موجودة في كل collection
4. ✅ جميع Indexes تم إنشاؤها
5. ✅ لا توجد أخطاء في console

---

## 🐛 حل المشاكل الشائعة

### خطأ: "Attribute already exists"
- **الحل**: تجاهل - هذا يعني أن الحقل موجود بالفعل

### خطأ: "Maximum attributes reached"
- **الحل**: Appwrite له حد أقصى للـ attributes. قد تحتاج لدمج بعض الحقول

### خطأ: "Cannot set default for required attribute"
- **الحل**: اجعل الحقل optional أو احذف default value

---

## 📚 المراجع

- [Appwrite Databases Documentation](https://appwrite.io/docs/databases)
- [Appwrite Node.js SDK](https://appwrite.io/docs/sdks#server)
- راجع `docs/architecture/database-schema.md` للمزيد من التفاصيل

---

**آخر تحديث**: December 9, 2025
