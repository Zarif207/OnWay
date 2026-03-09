# Global Smart Search Implementation Guide

## Overview
A comprehensive global search system that searches across multiple database collections (users, riders, bookings, reviews) with real-time suggestions, debouncing, and smart routing.

## Architecture

```
User Types → Debounced Input → Backend API → MongoDB Search → Formatted Results → Dropdown UI → Route Navigation
```

## Features

✅ **Multi-Collection Search** - Searches across 4 collections simultaneously
✅ **Real-Time Suggestions** - Dynamic dropdown with instant results
✅ **Debouncing** - 400ms delay to prevent excessive API calls
✅ **Case-Insensitive** - Uses MongoDB $regex for flexible matching
✅ **Partial Matching** - Finds results even with incomplete keywords
✅ **Grouped Results** - Results organized by category (Users, Riders, Bookings, Reviews)
✅ **Smart Routing** - Clicking a result navigates to the exact page with ID
✅ **Loading States** - Shows spinner during search
✅ **Error Handling** - Graceful error messages
✅ **No Results State** - Helpful message when nothing is found
✅ **Click Outside to Close** - Dropdown closes when clicking outside
✅ **Keyboard Support** - ESC key to clear search
✅ **Request Cancellation** - Aborts previous requests when new search starts
✅ **Result Limit** - Maximum 5 results per category

## Files Created

### Backend:
1. `backend/routes/search.js` - Search API endpoint
2. Updated `backend/server.js` - Registered search route

### Frontend:
1. `on-way/src/hooks/useGlobalSearch.js` - Custom React hook for search logic
2. `on-way/src/components/dashboard/GlobalSearch.jsx` - Search UI component
3. Updated `on-way/src/components/dashboard/Navbar.jsx` - Integrated search component

## API Endpoint

### Search Endpoint
```
GET /api/search?q=keyword&limit=5
```

**Query Parameters:**
- `q` (required) - Search keyword
- `limit` (optional) - Results per category (default: 5)

**Response Format:**
```json
{
  "success": true,
  "query": "minhaj",
  "totalResults": 8,
  "results": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "type": "user",
        "category": "Users",
        "title": "Minhaj Ahmed",
        "subtitle": "minhaj@example.com",
        "metadata": {
          "phone": "1234567890",
          "role": "passenger",
          "image": "..."
        },
        "route": "/dashboard/admin/user-management?id=507f1f77bcf86cd799439011"
      }
    ],
    "riders": [...],
    "bookings": [...],
    "reviews": [...]
  }
}
```

### Search by ID Endpoint
```
GET /api/search/by-id?id=xxx&type=user
```

**Query Parameters:**
- `id` (required) - MongoDB ObjectId
- `type` (required) - Type: user, rider, booking, review

## MongoDB Queries

### Users Search
```javascript
db.passenger.find({
  $or: [
    { name: /keyword/i },
    { email: /keyword/i },
    { phone: /keyword/i }
  ]
}).limit(5)
```

### Riders Search
```javascript
db.riders.find({
  $or: [
    { name: /keyword/i },
    { email: /keyword/i },
    { phone: /keyword/i },
    { licenseNumber: /keyword/i }
  ]
}).limit(5)
```

### Bookings Search
```javascript
db.bookings.find({
  $or: [
    { "pickupLocation.address": /keyword/i },
    { "dropoffLocation.address": /keyword/i },
    { bookingStatus: /keyword/i },
    { passengerId: /keyword/i }
  ]
}).limit(5)
```

### Reviews Search
```javascript
db.reviews.find({
  $or: [
    { userName: /keyword/i },
    { review: /keyword/i },
    { driverName: /keyword/i }
  ]
}).limit(5)
```

## Frontend Implementation

### Custom Hook Usage
```javascript
import { useGlobalSearch } from "@/hooks/useGlobalSearch";

const {
  query,              // Current search query
  results,            // Search results object
  loading,            // Loading state
  error,              // Error message
  totalResults,       // Total number of results
  isOpen,             // Dropdown open state
  handleQueryChange,  // Function to update query
  clearSearch,        // Function to clear search
  closeDropdown,      // Function to close dropdown
  openDropdown,       // Function to open dropdown
} = useGlobalSearch(400); // 400ms debounce delay
```

### Component Integration
```javascript
import GlobalSearch from "@/components/dashboard/GlobalSearch";

// In your component
<GlobalSearch />
```

## Routing Logic

### Route Mapping
| Type | Route Pattern |
|------|--------------|
| User | `/dashboard/admin/user-management?id={userId}` |
| Rider | `/dashboard/admin/driver-management?id={riderId}` |
| Booking | `/dashboard/admin/ride-management?id={bookingId}` |
| Review | `/dashboard/admin/reviews?id={reviewId}` |

### Navigation Implementation
```javascript
const router = useRouter();

const handleResultClick = (result) => {
  router.push(result.route);
  clearSearch();
};
```

## UI Components

### Search Input
- Icon: Search icon (left)
- Clear button: X icon (right, appears when typing)
- Placeholder: "Search users, riders, bookings..."
- Styling: Rounded, bordered, focus ring

### Dropdown
- Position: Absolute, below input
- Max height: 96 (24rem)
- Scrollable: Yes
- Shadow: Large
- Z-index: 50

### Result Item
- Icon: Category-specific (User, Truck, MapPin, Star)
- Title: Primary text (name, route, etc.)
- Subtitle: Secondary text (email, status, etc.)
- Badge: Status indicator (role, approval, rating)
- Hover: Background color change

### Category Icons
- Users: FiUser (blue)
- Riders: FiTruck (green)
- Bookings: FiMapPin (purple)
- Reviews: FiStar (yellow)

## Debouncing

### How It Works
1. User types in search input
2. Timer starts (400ms)
3. If user types again, timer resets
4. After 400ms of no typing, API call is made
5. Previous API calls are cancelled

### Benefits
- Reduces API calls
- Improves performance
- Better user experience
- Saves bandwidth

## Error Handling

### Frontend Errors
- Network errors
- API errors
- Timeout errors
- Cancelled requests (ignored)

### Backend Errors
- Empty query
- Invalid ID format
- Collection not found
- Database errors

### Error Display
```javascript
{error && (
  <div className="px-4 py-8 text-center">
    <p className="text-red-500">{error}</p>
  </div>
)}
```

## Performance Optimization

### 1. Request Cancellation
```javascript
// Cancel previous request
if (abortControllerRef.current) {
  abortControllerRef.current.abort();
}

// Create new abort controller
abortControllerRef.current = new AbortController();
```

### 2. Parallel Queries
```javascript
const [users, riders, bookings, reviews] = await Promise.all([
  searchUsers(),
  searchRiders(),
  searchBookings(),
  searchReviews(),
]);
```

### 3. Result Limiting
- Maximum 5 results per category
- Total maximum: 20 results

### 4. Projection
- Only fetch required fields
- Reduces data transfer

## Testing

### Manual Testing

**Test 1: Search for User**
```
1. Type "minhaj" in search input
2. Wait for results
3. Should see users named Minhaj
4. Click a result
5. Should navigate to user management page
```

**Test 2: Search for Rider**
```
1. Type "driver" in search input
2. Should see riders with "driver" in name/email
3. Check approval status badge
4. Click a result
5. Should navigate to driver management page
```

**Test 3: Search for Booking**
```
1. Type location name (e.g., "Dhaka")
2. Should see bookings with that location
3. Check status badge
4. Click a result
5. Should navigate to ride management page
```

**Test 4: No Results**
```
1. Type "xyzabc123" (random text)
2. Should see "No results found" message
3. Should show suggestion to try different keywords
```

**Test 5: Clear Search**
```
1. Type something
2. Click X button
3. Search should clear
4. Dropdown should close
```

### Automated Testing

```bash
# Test search API
curl "http://localhost:4000/api/search?q=minhaj&limit=5"

# Test search by ID
curl "http://localhost:4000/api/search/by-id?id=507f1f77bcf86cd799439011&type=user"
```

## Customization

### Change Debounce Delay
```javascript
const { ... } = useGlobalSearch(500); // 500ms delay
```

### Change Result Limit
```javascript
// In API call
const response = await axios.get(`${API_URL}/search`, {
  params: {
    q: searchQuery,
    limit: 10, // 10 results per category
  },
});
```

### Add New Collection

**1. Update Backend Route:**
```javascript
// In backend/routes/search.js
const newCollection = await collections.newCollection
  .find({ name: searchRegex })
  .limit(resultLimit)
  .toArray();

// Add to results
newItems: newCollection.map(item => ({
  id: item._id.toString(),
  type: "newType",
  category: "New Items",
  title: item.name,
  subtitle: item.description,
  route: `/dashboard/admin/new-items?id=${item._id}`,
}))
```

**2. Update Frontend Component:**
```javascript
// Add icon
case "newType":
  return <FiNewIcon className="text-color-500" />;

// Add results section
{results.newItems.length > 0 && (
  <div className="mb-2">
    <div className="px-4 py-2 bg-gray-50">
      <h3>New Items ({results.newItems.length})</h3>
    </div>
    {/* Render items */}
  </div>
)}
```

## Troubleshooting

### Issue: Search not working

**Check 1: Backend server running**
```bash
# Should be running on port 4000
curl http://localhost:4000/api/health
```

**Check 2: Search route registered**
```javascript
// In backend/server.js
app.use("/api/search", searchRoutes);
```

**Check 3: Environment variable**
```env
# In on-way/.env.local
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Issue: Dropdown not appearing

**Check 1: Results exist**
```javascript
console.log("Results:", results);
console.log("Total:", totalResults);
```

**Check 2: isOpen state**
```javascript
console.log("Dropdown open:", isOpen);
```

**Check 3: Z-index**
```javascript
// Ensure dropdown has higher z-index
className="... z-50"
```

### Issue: Slow search

**Solution 1: Add database indexes**
```javascript
// In MongoDB
db.passenger.createIndex({ name: "text", email: "text" });
db.riders.createIndex({ name: "text", email: "text" });
db.bookings.createIndex({ "pickupLocation.address": "text" });
```

**Solution 2: Increase debounce delay**
```javascript
const { ... } = useGlobalSearch(600); // 600ms
```

**Solution 3: Reduce result limit**
```javascript
// In API call
params: { q: searchQuery, limit: 3 }
```

## Security Considerations

1. **Input Validation** - Backend validates search query
2. **SQL Injection Prevention** - MongoDB $regex is safe
3. **Rate Limiting** - Consider adding rate limiting
4. **Authentication** - Ensure user is authenticated
5. **Authorization** - Check user has permission to search

## Future Enhancements

1. **Search History** - Save recent searches
2. **Popular Searches** - Show trending searches
3. **Advanced Filters** - Filter by date, status, etc.
4. **Fuzzy Search** - Handle typos better
5. **Highlighting** - Highlight matched text
6. **Keyboard Navigation** - Arrow keys to navigate results
7. **Search Analytics** - Track search queries
8. **Voice Search** - Add voice input
9. **Export Results** - Download search results
10. **Saved Searches** - Save frequently used searches

## Best Practices

1. ✅ Use debouncing to reduce API calls
2. ✅ Cancel previous requests
3. ✅ Show loading states
4. ✅ Handle errors gracefully
5. ✅ Limit results to prevent overload
6. ✅ Use MongoDB indexes for performance
7. ✅ Validate input on backend
8. ✅ Use proper HTTP status codes
9. ✅ Log errors for debugging
10. ✅ Test with various inputs

---

**Status:** ✅ Fully Implemented
**Last Updated:** March 8, 2026
**Version:** 1.0.0
