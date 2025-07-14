# Airtable Integration Setup Guide

## 1. Create Your Airtable Base

### Required Tables and Fields:

#### **Clients Table**
- `Name` (Single line text)
- `Email` (Email)
- `Phone` (Phone number)
- `Last Visit` (Date)
- `Next Appointment` (Date)
- `Preferred Service` (Single line text)
- `Total Visits` (Number)
- `Total Spent` (Currency)
- `Tags` (Multiple select: VIP, Regular, New Client, No-show Risk)
- `Notes` (Long text)
- `Created At` (Created time)

#### **Appointments Table**
- `Client ID` (Link to Clients table)
- `Client Name` (Lookup from Clients)
- `Service` (Single line text)
- `Staff` (Single select)
- `Date` (Date)
- `Time` (Single line text)
- `Duration` (Number - in minutes)
- `Status` (Single select: scheduled, completed, cancelled, no-show)
- `Price` (Currency)
- `Notes` (Long text)

#### **Services Table**
- `Name` (Single line text)
- `Duration` (Number - in minutes)
- `Price` (Currency)
- `Description` (Long text)
- `Category` (Single select: Hair, Nails, Facial, Massage, etc.)

#### **Staff Table**
- `Name` (Single line text)
- `Email` (Email)
- `Phone` (Phone number)
- `Specialties` (Multiple select)
- `Active` (Checkbox)

#### **Availability Table**
- `Staff` (Link to Staff table)
- `Date` (Date)
- `Start Time` (Single line text)
- `End Time` (Single line text)
- `Is Available` (Checkbox)
- `Appointment ID` (Link to Appointments table)

#### **Promotions Table**
- `Code` (Single line text)
- `Discount Type` (Single select: Percentage, Fixed Amount)
- `Discount Value` (Number)
- `Description` (Long text)
- `Active` (Checkbox)
- `Uses Count` (Number)
- `Expiry Date` (Date)

#### **Revenue Table**
- `Date` (Date)
- `Amount` (Currency)
- `Source` (Single select: Appointment, Product, Tip)
- `Payment Method` (Single select: Cash, Card, Digital)
- `Appointment ID` (Link to Appointments table)

## 2. Get Your Airtable Credentials

### API Key:
1. Go to [Airtable Account](https://airtable.com/account)
2. Generate a personal access token
3. Copy the token

### Base ID:
1. Go to your Airtable base
2. Click "Help" → "API documentation"
3. Your base ID is shown in the URL: `https://airtable.com/{BASE_ID}/api/docs`

## 3. Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Airtable credentials:
   ```env
   AIRTABLE_API_KEY=your_actual_api_key_here
   AIRTABLE_BASE_ID=your_actual_base_id_here
   ```

## 4. Test the Integration

1. Start your development server:
   ```bash
   bun run dev
   ```

2. Navigate to the clients page to test the integration
3. Check the browser console for any errors

## 5. Usage Examples

### Fetching Clients:
```typescript
import { useClients } from '@/hooks/useAirtable';

function ClientsList() {
  const { clients, loading, error } = useClients();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {clients.map(client => (
        <div key={client.id}>{client.name}</div>
      ))}
    </div>
  );
}
```

### Creating a New Client:
```typescript
const { createClient } = useClients();

const handleCreateClient = async () => {
  try {
    await createClient({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      totalVisits: 0,
      totalSpent: 0,
      tags: ['New Client'],
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create client:', error);
  }
};
```

## 6. Customization

### Adding New Fields:
1. Add the field to your Airtable table
2. Update the interface in `/src/lib/airtable.ts`
3. Update the operations to include the new field

### Adding New Tables:
1. Create the table in Airtable
2. Add the table name to `TABLES` constant
3. Create new interfaces and operations
4. Add API routes if needed

## 7. Troubleshooting

### Common Issues:

1. **"Table not found" error:**
   - Check table names match exactly (case-sensitive)
   - Verify base ID is correct

2. **"Field not found" error:**
   - Check field names match exactly
   - Ensure all required fields exist

3. **Permission errors:**
   - Verify API key has correct permissions
   - Check base sharing settings

4. **Rate limiting:**
   - Airtable has rate limits (5 requests/second)
   - Implement proper error handling and retries

### Debug Mode:
Add this to your `.env.local` for detailed logging:
```env
NODE_ENV=development
DEBUG=airtable:*
```

## 8. Production Considerations

1. **Error Handling:** Implement proper error boundaries
2. **Caching:** Consider implementing data caching for better performance
3. **Rate Limiting:** Implement request queuing for high-traffic scenarios
4. **Security:** Never expose API keys in client-side code
5. **Backup:** Regularly backup your Airtable data

## 9. Next Steps

Once Airtable is connected, you can:
- Integrate WhatsApp API (Wassenger/Twilio)
- Add OpenAI for AI features
- Implement real-time updates with webhooks
- Add data synchronization between services