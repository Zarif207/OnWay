# Edit Profile - Quick Setup Checklist ✅

## Pre-Flight Checks

### Frontend Setup
- [x] React state management implemented:
  - `isEditMode` - tracks edit/view mode
  - `isSaving` - tracks loading state
  - `formData` - stores editable fields
  - `successMessage` / `errorMessage` - feedback messages

- [x] UI Components:
  - Edit Profile button toggles edit mode
  - Email field is disabled (read-only)
  - Name, Phone, Address, Language, Notifications are editable
  - Save Changes and Cancel buttons appear in edit mode
  - Loading spinner shows while saving

- [x] API Call:
  - Endpoint: `http://localhost:4000/api/passenger/profile/update`
  - Method: `PUT`
  - Includes `userId` in request body
  - Handles success and error responses

### Backend Setup
- [x] Route created: `PUT /api/passenger/profile/update`
- [x] Input validation:
  - Validates `userId`
  - Validates `name` (required)
  - Trims whitespace
- [x] MongoDB update:
  - Uses `findOneAndUpdate` with `returnDocument: "after"`
  - Returns updated user data
  - Removes password before sending response
- [x] Error handling:
  - Returns proper HTTP status codes
  - Includes error messages

---

## Running the Application

### Step 1: Start Backend
```bash
cd backend
npm run dev
```
Expected: "✅ MongoDB connected"

### Step 2: Start Frontend
```bash
cd on-way
npm run dev
```
Expected: "▲ Next.js is running..."

### Step 3: Navigate to Profile
- Login to the application
- Go to Profile page
- Should see "Account Settings" page with user info

---

## Testing the Feature

### Test 1: Edit Profile (Happy Path)
1. Click "Edit Profile" button
2. Modify the "Name" field
3. Modify the "Phone" field
4. Click "Save Changes"
5. ✅ Success message should appear: "Profile updated successfully!"
6. ✅ UI should update with new data
7. ✅ Edit mode should exit
8. ✅ Database should be updated

**To verify database update:**
```bash
# In MongoDB Compass or mongo CLI
use onWayDB
db.passenger.findOne({ email: "user@example.com" })
# Check that name, phone, etc. are updated
```

### Test 2: Email Field is Read-Only
1. Click "Edit Profile"
2. Try to click on the Email field
3. ✅ Should not be able to edit (disabled)
4. ✅ Should see "Cannot be changed" text

### Test 3: Cancel Button
1. Click "Edit Profile"
2. Modify some fields
3. Click "Cancel"
4. ✅ Changes should be reverted
5. ✅ Edit mode should exit
6. ✅ Database should NOT be updated

### Test 4: Validation (Empty Name)
1. Click "Edit Profile"
2. Clear the "Name" field
3. Click "Save Changes"
4. ✅ Error message: "Name is required"
5. ✅ Not submitted to database

### Test 5: Language Selection
1. Click "Edit Profile"
2. Change "Preferred Language" dropdown
3. Click "Save Changes"
4. ✅ Language preference should be saved

### Test 6: Notifications Toggle
1. Click "Edit Profile"
2. Toggle the "Push Notifications" switch
3. Click "Save Changes"
4. ✅ Notification setting should be saved

---

## Debugging Guide

### Issue: Save button doesn't work, console shows 404

**Problem**: Backend endpoint not found
**Solution**:
1. Check endpoint path: `http://localhost:4000/api/passenger/profile/update`
2. Verify backend is running
3. Check backend logs for any errors
4. Restart backend: `npm run dev`

**Debug Code in Console:**
```javascript
// Test the endpoint
fetch("http://localhost:4000/api/passenger/profile/update", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    userId: "YOUR_USER_ID",
    name: "Test",
    phone: "123456789",
    address: "",
    notifications: true,
    language: "English"
  })
}).then(r => r.json()).then(console.log)
```

---

### Issue: Save works but data doesn't persist

**Problem**: MongoDB not updating
**Solution**:
1. Check MongoDB connection in backend logs
2. Verify MongoDB URI in `.env`
3. Check database name and collection name: `onWayDB.passenger`
4. Verify user ID is valid ObjectId format

**Debug**: Check backend logs for update errors

---

### Issue: Email field is editable (should be read-only)

**Problem**: Frontend rendering issue
**Solution**:
1. Hard refresh browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache and cookies
3. Verify `disabled` attribute is on email input

---

### Issue: Success message appears but data doesn't update on UI

**Problem**: Response format mismatch
**Solution**:
1. Check backend response includes `success: true` and `data: {...}`
2. Verify frontend correctly extracts `result.data`
3. Check that `setUser(result.data)` is being called

---

## File Locations Reference

📁 **Frontend**
```
on-way/
└── src/
    └── app/
        └── dashboard/
            └── passenger/
                └── profile/
                    └── page.jsx  ← Edit Profile Component
```

📁 **Backend**
```
backend/
└── routes/
    └── passenger.js  ← Profile Update Route
```

📁 **Database**
```
MongoDB (onWayDB)
└── Collections
    └── passenger  ← User documents
```

---

## API Request/Response Examples

### Successful Request & Response

**Request:**
```
PUT http://localhost:4000/api/passenger/profile/update
Content-Type: application/json

{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Ahmed Smith",
  "phone": "+1-555-1234",
  "address": "Dhaka, Bangladesh",
  "language": "Bengali",
  "notifications": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Ahmed Smith",
    "email": "ahmed@example.com",
    "phone": "+1-555-1234",
    "address": "Dhaka, Bangladesh",
    "language": "Bengali",
    "notifications": true,
    "role": "passenger",
    "image": "https://...",
    "updatedAt": "2024-03-09T12:30:45.123Z"
  }
}
```

### Error Response

**Request with missing name:**
```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "",
  "phone": "+1-555-1234"
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Name is required"
}
```

---

## Performance Tips

- Save is near-instant (< 1s typically)
- Database update is atomic (no partial updates)
- Original data is stored in memory for cancel
- No unnecessary re-renders

---

## Security Notes

✅ Implemented:
- Email field is read-only (cannot be changed)
- Password is never returned in responses
- Input validation on both frontend and backend
- Trim whitespace to prevent injection
- Proper error handling without exposing internals

⬜ Consider adding:
- Authentication check on backend route
- Rate limiting on profile updates
- Audit logging for data changes
- Input length validation

---

## Next Features to Add

1. **Avatar Upload**
   - Add file input for profile picture
   - Upload to cloud storage (Firebase, AWS S3)
   - Update `image` field in database

2. **Password Change**
   - Add password change form
   - Create new route: `PUT /api/passenger/change-password`
   - Verify current password before change

3. **Email Verification**
   - Allow email changes with verification
   - Send verification email
   - Update email only after verification

4. **Notification Preferences**
   - More granular notification controls
   - Email notifications, SMS, Push
   - Frequency settings (daily, weekly, etc.)

---

## Contact & Support

If something isn't working:
1. Check backend logs: `npm run dev` output
2. Check frontend console: F12 → Console tab
3. Check MongoDB connection status
4. Verify `.env` variables are set
5. Restart both frontend and backend

---

**Last Updated**: March 9, 2026
**Status**: ✅ Ready for Testing
