# 🚀 ADMIN PANEL SETUP GUIDE

## Adım 1: Database Migration

### Option A: Supabase Dashboard (Recommended) ✅

1. **Supabase Dashboard aç:**
   ```
   https://supabase.com/dashboard
   ```

2. **SQL Editor-ə keç:**
   - Sol menüdan "SQL Editor" seç
   - "New query" düyməsinə bas

3. **Migration faylını köçür:**
   - `server/migrations/create_admin_tables_FINAL.sql` faylını aç
   - Bütün məzmunu copy et (Ctrl+A, Ctrl+C)
   - SQL Editor-ə paste et (Ctrl+V)

4. **İşə sal:**
   - "Run" düyməsinə bas (və ya Ctrl+Enter)
   - Uğurlu mesaj görməli:
     ```
     ✅ Success. No rows returned
     ```

### Option B: Command Line (Alternative)

```bash
cd server
npm run migration:run create_admin_tables_FINAL.sql
```

**VƏ YA:**

```bash
node run-admin-migration.js
```

---

## Adım 2: İlk Super Admin Yaradılması

### SQL ilə (Supabase SQL Editor):

```sql
-- 1. Öz email-inizi daxil edin
DO $$
DECLARE
  user_id UUID;
  super_admin_role_id UUID;
BEGIN
  -- Find your user
  SELECT id INTO user_id 
  FROM profiles 
  WHERE email = 'YOUR_EMAIL@example.com'  -- ⚠️ BU EMAIL-I DƏYİŞDİR
  LIMIT 1;

  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with that email!';
  END IF;

  -- Get super admin role
  SELECT id INTO super_admin_role_id 
  FROM admin_roles 
  WHERE name = 'super_admin';

  -- Update user to admin
  UPDATE profiles 
  SET 
    role = 'admin',
    admin_role_id = super_admin_role_id,
    is_verified = true
  WHERE id = user_id;

  RAISE NOTICE 'Successfully promoted user % to Super Admin!', user_id;
END $$;
```

---

## Adım 3: Test Et

### Backend Test:

```bash
cd server
npm run dev
```

Görməli:
```
✅ Supabase connected successfully
✅ Health check passed: 1 profiles found
🚀 Server running on port 5000
```

### Frontend Test:

```bash
cd "Create Prediction Interface"
npm run dev
```

### Admin Panel Test:

1. **Login ol:**
   ```
   http://localhost:3000
   ```

2. **Admin Panel-ə keç:**
   ```
   http://localhost:3000/admin
   ```

3. **Browser Console test:**
   ```javascript
   // F12 → Console
   const token = JSON.parse(localStorage.getItem('auth_token'))?.access_token;
   fetch('http://localhost:5000/api/v1/admin/dashboard/stats', {
     headers: { 
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   })
   .then(r => r.json())
   .then(d => console.log('✅ Admin Panel Works!', d));
   ```

**Expected Output:**
```javascript
✅ Admin Panel Works! 
{
  success: true,
  stats: {
    users: { total: 3, active_24h: 0, ... },
    predictions: { total: 20, active: 19, ... },
    bets: { total: 25, ... },
    revenue: { ... }
  }
}
```

---

## Adım 4: Permission System Aktivləşdir (Optional)

### Frontend (AdminLayout.tsx):

Sətir 56-59-u uncomment et:
```typescript
// Bu sətrləri:
const data = await adminApi.getMyPermissions();
setPermissions(data);
```

### Frontend (PermissionGuard.tsx):

Sətir 27-74-ü uncomment et və return statement-i comment et.

---

## 🎊 Bitdi!

İndi admin panel **TAM HAZIR VƏ İŞLƏK VƏZIYYƏTDƏDIR**!

### Test edə bilərsiniz:
✅ Dashboard → Stats və charts görün
✅ Users → User list və management
✅ Predictions → Prediction management
✅ Resolution Queue → Submissions
✅ Reports → User reports
✅ KYC → Document verification
✅ Support → Tickets
✅ Finance → Analytics
✅ Settings → System config
✅ Audit Logs → Admin actions
✅ Broadcast → Announcements

---

## 🆘 Problem Olarsa?

### Database yoxla:
1. Supabase Dashboard → Table Editor
2. Bu tablların olduğunu yoxla:
   - `admin_roles`
   - `admin_permissions`
   - `audit_logs`
   - `system_settings`
   - `admin_user_notes`
   - `prediction_resolution_queue`

### Backend yoxla:
```bash
curl http://localhost:5000/api/v1/health
```

Expected:
```json
{"status":"ok","message":"Server is running"}
```

### Admin access yoxla:
```bash
# Get your token from browser localStorage
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:5000/api/v1/admin/dashboard/stats
```

---

## 📚 Documentation

- `PROJECT_STATUS_FINAL.md` - Full project status
- `ADMIN_PANEL_COMPLETE.md` - Admin panel details
- `test-admin-panel-full.js` - Comprehensive test script

**İndi Admin Panel-dən istifadə edə bilərsiniz! 🚀**

