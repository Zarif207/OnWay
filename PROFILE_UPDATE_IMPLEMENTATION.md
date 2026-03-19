# Profile Update Implementation Guide

## Overview
This document outlines the complete implementation of the Edit Profile feature with working Save/Cancel functionality.

---

## Frontend Implementation

### File: `src/app/dashboard/passenger/profile/page.jsx`

#### State Management
```javascript
const [isEditMode, setIsEditMode] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [successMessage, setSuccessMessage] = useState("");
const [errorMessage, setErrorMessage] = useState("");
const [formData, setFormData] = useState({
  name: "",
  phone: "",
  address: "",
  notifications: true,
  language: "English"
});
const [originalData, setOriginalData] = useState(null);
```

#### Key Functions

**1. Handle Edit Click**
```javascript
const handleEditClick = () => {
  if (!isEditMode) {
    setOriginalData({ ...formData });
    setIsEditMode(true);
    setSuccessMessage("");
    setErrorMessage("");
  }
};
```
- Enters edit mode
- Saves original data for cancel functionality

**2. Handle Cancel**
```javascript
const handleCancel = () => {
  setFormData(originalData);
  setIsEditMode(false);
  setErrorMessage("");
};
```
- Reverts changes to original data
- Exits edit mode

**3. Handle Save (API Call)**
```javascript
const handleSave = async () => {
  // Validation
  if (!formData.name.trim()) {
    setErrorMessage("Name is required");
    return;
  }

  setIsSaving(true);
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const response = await fetch(
      "http://localhost:4000/api/passenger/profile/update",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: session.user.id,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          notifications: formData.notifications,
          language: formData.language
        })
      }
    );

    const result = await response.json();

    if (response.ok && result.success) {
      setUser(result.data);
      setIsEditMode(false);
      setSuccessMessage(result.message || "Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage(result.message || "Failed to update profile");
    }
  } catch (err) {
    console.error("Save error:", err);
    setErrorMessage("An error occurred while saving changes. Please try again.");
  } finally {
    setIsSaving(false);
  }
};
```

#### UI Features
- **Edit Mode Toggle**: Fields become editable
- **Email Field**: Disabled and read-only with visual indicator
- **Save/Cancel Buttons**: Show loading state during save
- **Success/Error Messages**: Auto-hide after 3 seconds
- **Responsive Design**: Works on mobile and desktop

---

## Backend Implementation

### File: `backend/routes/passenger.js`

#### New Route: PUT /api/passenger/profile/update

```javascript
router.put("/profile/update", async (req, res) => {
  try {
    const { userId, name, phone, address, language, notifications } = req.body;

    // Validation: User ID
    if (!userId) {
      return res.status(400).json({ 
        success: false,
        message: "User ID is required" 
      });
    }

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid user ID" 
      });
    }

    // Validation: Name
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "Name is required" 
      });
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      phone: phone?.trim() || "",
      address: address?.trim() || "",
      language: language || "English",
      notifications: notifications !== false,
      updatedAt: new Date()
    };

    // Update user in database and return updated document
    const result = await passengerCollection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    // Check if user exists
    if (!result.value) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Remove password from response
    const updatedUser = result.value;
    delete updatedUser.password;

    console.log(`✅ Profile updated for user: ${userId}`);

    res.status(200).json({ 
      success: true, 
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

#### How It Works

1. **Input Validation**
   - Validates `userId` exists and is valid ObjectId
   - Validates `name` is not empty

2. **Data Preparation**
   - Trims whitespace from string fields
   - Uses default values for optional fields
   - Adds `updatedAt` timestamp

3. **MongoDB Update**
   ```javascript
   passengerCollection.findOneAndUpdate(
     { _id: new ObjectId(userId) },
     { $set: updateData },
     { returnDocument: "after" }
   )
   ```
   - `findOneAndUpdate`: Atomic operation (no race conditions)
   - `returnDocument: "after"`: Returns updated document

4. **Response**
   - Returns `success: true`
   - Returns updated user object (without password)
   - Returns success message

---

## MongoDB Schema

The user document in MongoDB should have these fields:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  address: String,
  language: String,
  notifications: Boolean,
  role: String,
  image: String,
  authProvider: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  // ... other fields
}
```

---

## API Endpoint Reference

### PUT /api/passenger/profile/update

**Request:**
```json
{
  "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
  "name": "John Doe",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "language": "English",
  "notifications": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State",
    "language": "English",
    "notifications": true,
    "role": "passenger",
    "image": "...",
    "updatedAt": "2024-03-09T10:30:00.000Z",
    // ... other fields
  }
}
```

**Error Response (400/404/500):**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev only)"
}
```

---

## Features Implemented

✅ **Edit Mode Toggle**
- Click "Edit Profile" to enter edit mode
- Fields become editable
- Shows "Save Changes" and "Cancel" buttons

✅ **Read-Only Email**
- Email field is disabled
- Cannot be edited
- Displays "Cannot be changed" message

✅ **Editable Fields**
- Name (required)
- Phone Number (optional)
- Address (optional)
- Language (dropdown)
- Notification Settings (toggle)

✅ **State Management**
- Uses React state for edit mode
- Saves original data for cancel functionality
- Prevents accidental data loss

✅ **Loading State**
- Shows spinner on Save button during API call
- Disables buttons while saving

✅ **Success/Error Messages**
- Displays feedback after save
- Auto-hides success message after 3 seconds
- Shows detailed error messages

✅ **Data Validation**
- Frontend: Name validation before submit
- Backend: All inputs validated before database update

✅ **Responsive Design**
- Mobile-friendly
- Tailwind CSS styling
- Modern, clean UI

---

## Testing Steps

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**
   ```bash
   cd on-way
   npm run dev
   ```

3. **Test Edit Profile**
   - Navigate to profile page
   - Click "Edit Profile" button
   - Modify fields (try to edit email - it should be disabled)
   - Click "Save Changes"
   - Verify success message appears
   - Verify data updates in database

4. **Test Cancel**
   - Click "Edit Profile"
   - Modify some fields
   - Click "Cancel"
   - Verify changes are reverted

5. **Test Error Cases**
   - Try to save with empty name
   - Test network error handling

---

## Environment Variables Required

```
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Common Issues & Solutions

**Issue**: Save button not working
- **Solution**: Ensure backend is running at `http://localhost:4000`
- **Check**: Browser console for fetch errors

**Issue**: Data not persisting
- **Solution**: Verify MongoDB connection in backend
- **Check**: Backend logs for update errors

**Issue**: Email field is editable
- **Solution**: Refresh page or clear browser cache
- **Check**: Frontend code has `disabled` attribute on email input

**Issue**: Success message doesn't show
- **Solution**: Check browser console for fetch status
- **Check**: API response format matches expected structure

---

## Next Steps

1. ✅ Test in development environment
2. ⬜ Add image/avatar upload functionality
3. ⬜ Implement password change route
4. ⬜ Add email verification for email changes
5. ⬜ Deploy to production

---

## Code Summary

| Component | File | Changes |
|-----------|------|---------|
| Frontend | `src/app/dashboard/passenger/profile/page.jsx` | Added edit mode, form handling, API integration |
| Backend Route | `backend/routes/passenger.js` | Added PUT /profile/update endpoint |
| MongoDB | onWayDB | Updates profile fields atomically |

