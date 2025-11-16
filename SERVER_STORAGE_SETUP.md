# Server-Side User Storage Implementation

## Overview
User registration data (name and phone number) is now saved to the server in addition to localStorage. This provides persistent storage and allows for data backup, analysis, and retrieval.

## Implementation Details

### 1. API Endpoints Created

#### POST `/api/register`
- **Purpose**: Register a new user or update existing user
- **Method**: POST
- **Request Body**:
  ```json
  {
    "name": "أحمد محمد",
    "phone": "0512345678"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "1699876543210",
      "name": "أحمد محمد",
      "phone": "0512345678",
      "registeredAt": "2024-11-12T10:30:00.000Z",
      "updatedAt": "2024-11-12T10:30:00.000Z"
    },
    "message": "User registered successfully"
  }
  ```
- **Features**:
  - Validates input (name and phone are required)
  - Sanitizes phone number (removes spaces)
  - Prevents duplicate registrations (updates if phone already exists)
  - Creates data directory automatically if it doesn't exist

#### GET `/api/users/[phone]`
- **Purpose**: Retrieve user data by phone number
- **Method**: GET
- **Example**: `/api/users/0512345678`
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "id": "1699876543210",
      "name": "أحمد محمد",
      "phone": "0512345678",
      "registeredAt": "2024-11-12T10:30:00.000Z",
      "updatedAt": "2024-11-12T10:30:00.000Z"
    }
  }
  ```

### 2. Data Storage

#### Location
- **File**: `data/users.json`
- **Format**: JSON array of user objects
- **Structure**:
  ```json
  [
    {
      "id": "1699876543210",
      "name": "أحمد محمد",
      "phone": "0512345678",
      "registeredAt": "2024-11-12T10:30:00.000Z",
      "updatedAt": "2024-11-12T10:30:00.000Z"
    },
    {
      "id": "1699876543211",
      "name": "فاطمة علي",
      "phone": "0501234567",
      "registeredAt": "2024-11-12T11:00:00.000Z",
      "updatedAt": "2024-11-12T11:00:00.000Z"
    }
  ]
  ```

#### Git Configuration
- The `/data` directory is added to `.gitignore` to prevent committing user data to version control
- A `.gitkeep` file is included to maintain the directory structure

### 3. Updated Files

#### `pages/register.js`
- Changed `handleSubmit` to async function
- Added server API call before localStorage
- Includes error handling with Arabic error messages
- Still saves to localStorage as backup for offline access

### 4. Data Flow

```
User fills form
    ↓
Submit button clicked
    ↓
POST request to /api/register
    ↓
Server saves to data/users.json
    ↓
Response sent back to client
    ↓
Client saves to localStorage
    ↓
User redirected to main page
```

## Benefits

1. **Persistent Storage**: Data survives even if user clears browser cache
2. **Centralized Data**: All registrations in one place on the server
3. **Easy Export**: Simple JSON file can be easily processed/exported
4. **Backup**: Data is not lost if user switches devices
5. **Analytics**: Can analyze registration data on the server
6. **Future-Ready**: Easy to migrate to a proper database (MongoDB, PostgreSQL, etc.)

## Security Considerations

1. **Data Privacy**: 
   - User data is stored server-side and not exposed to other users
   - The `/data` directory is excluded from version control
   
2. **Input Validation**:
   - Phone numbers are validated (10 digits required)
   - Names must be at least 3 characters
   - Phone numbers are sanitized (spaces removed)

3. **Error Handling**:
   - Proper error messages in Arabic
   - Failed registrations don't break the application

## Future Enhancements

### Short Term
1. Add user authentication/login
2. Allow users to view their game history
3. Export functionality for admin

### Long Term
1. Migrate to proper database (MongoDB/PostgreSQL)
2. Add admin dashboard to view all registrations
3. Add data analytics and reporting
4. Implement user privacy controls (GDPR compliance)

## Migration to Database

When ready to migrate to a database, the structure is already set up for easy transition:

### MongoDB Example
```javascript
const userSchema = new Schema({
  name: String,
  phone: { type: String, unique: true },
  registeredAt: Date,
  updatedAt: Date,
  gameProgress: {
    flowerGame: Boolean,
    personalityQuiz: Boolean,
    commitmentQuiz: Boolean
  }
})
```

### PostgreSQL Example
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(10) UNIQUE NOT NULL,
  registered_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### Test Registration
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/register`
3. Fill in name and phone number
4. Submit the form
5. Check the `data/users.json` file to verify data was saved

### Test API Directly

Using curl:
```bash
# Register a user
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"أحمد محمد","phone":"0512345678"}'

# Get user data
curl http://localhost:3000/api/users/0512345678
```

## Troubleshooting

### Issue: Data not saving
- **Check**: Ensure the `data` directory exists and is writable
- **Solution**: The API automatically creates the directory, but check file permissions

### Issue: Duplicate users not updating
- **Check**: Phone number format (should be exactly 10 digits, no spaces)
- **Solution**: The API sanitizes phone numbers automatically

### Issue: Registration fails silently
- **Check**: Browser console for errors
- **Check**: Server console for error messages
- **Solution**: Ensure Next.js server is running properly

## Support

For issues or questions, check:
1. Browser console for client-side errors
2. Server console for API errors
3. `data/users.json` file to verify data is being saved

