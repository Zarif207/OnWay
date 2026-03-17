# Geocoding CORS Error Fix

## Problem
The frontend was getting a Network Error (AxiosError) when trying to fetch location suggestions from the Nominatim API directly. This was caused by CORS (Cross-Origin Resource Sharing) restrictions.

## Root Cause
- Direct API calls from browser to Nominatim API were blocked by CORS policy
- Nominatim requires proper User-Agent headers which browsers don't allow setting
- Rate limiting was difficult to manage from the frontend

## Solution
Created a backend proxy endpoint to handle all geocoding requests.

### Changes Made

#### 1. Backend Proxy Route (`backend/routes/geocoding.js`)
- ✅ Created `/api/geocoding/search` endpoint for location search
- ✅ Created `/api/geocoding/reverse` endpoint for reverse geocoding
- ✅ Implemented rate limiting (1 second between requests)
- ✅ Proper error handling and response formatting
- ✅ Sets correct User-Agent headers

#### 2. Updated Server (`backend/server.js`)
- ✅ Added geocoding routes import
- ✅ Registered `/api/geocoding` endpoint

#### 3. Updated Frontend Service (`on-way/src/utils/geocodingService.js`)
- ✅ Changed from direct Nominatim API calls to backend proxy
- ✅ Updated API base URL to use backend
- ✅ Removed frontend rate limiting (handled by backend)
- ✅ Updated response parsing for new format

## API Endpoints

### Search Locations
```http
GET /api/geocoding/search?q=Dhaka&countryCode=BD&limit=8
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "lat": 23.8103,
      "lon": 90.4125,
      "name": "Dhaka, Bangladesh",
      "address": {...},
      "type": "city"
    }
  ],
  "count": 1
}
```

### Reverse Geocode
```http
GET /api/geocoding/reverse?lat=23.8103&lon=90.4125
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lat": 23.8103,
    "lon": 90.4125,
    "name": "Dhaka, Bangladesh",
    "address": {...},
    "type": "city"
  }
}
```

## Benefits

1. **No CORS Issues**: Backend handles all external API calls
2. **Better Rate Limiting**: Centralized rate limiting on backend
3. **Improved Security**: API keys and headers managed server-side
4. **Better Error Handling**: Consistent error responses
5. **Caching Potential**: Can add caching layer on backend

## Testing

1. **Start Backend:**
```bash
cd backend
npm start
```

2. **Test Geocoding:**
```bash
# Search
curl "http://localhost:5000/api/geocoding/search?q=Dhaka&countryCode=BD"

# Reverse
curl "http://localhost:5000/api/geocoding/reverse?lat=23.8103&lon=90.4125"
```

3. **Test Frontend:**
- Open http://localhost:3000/onway-book
- Try typing in the location input
- Should see suggestions without errors

## Environment Variables

Make sure your frontend has:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Error Handling

The backend now handles:
- ✅ Rate limiting (429 Too Many Requests)
- ✅ Invalid coordinates (400 Bad Request)
- ✅ Network errors (500 Internal Server Error)
- ✅ Empty results (returns empty array)

## Migration Notes

- Old code called Nominatim directly: `https://nominatim.openstreetmap.org/search`
- New code calls backend proxy: `http://localhost:5000/api/geocoding/search`
- Response format changed to include `success` and `data` wrapper
- Rate limiting now handled by backend

## Future Improvements

1. Add caching layer (Redis) for frequently searched locations
2. Implement request deduplication
3. Add analytics for popular searches
4. Consider alternative geocoding providers as fallback
5. Add location search history

This fix resolves the CORS issue and provides a more robust geocoding solution!