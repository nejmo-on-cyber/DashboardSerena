from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import requests
from airtable import Airtable
import json

# Load environment variables
load_dotenv()

app = FastAPI(title="Airtable Dashboard API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000", "*"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Airtable configuration
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID")
TABLE_NAME = os.getenv("TABLE_NAME", "Table 1")

# Initialize Airtable connections
airtable = None
airtable_clients = None
if AIRTABLE_API_KEY and AIRTABLE_BASE_ID and AIRTABLE_API_KEY != "your_airtable_api_key_here" and AIRTABLE_BASE_ID != "your_airtable_base_id_here":
    airtable = Airtable(AIRTABLE_BASE_ID, TABLE_NAME, api_key=AIRTABLE_API_KEY)
    # Also connect to Clients table for real client names
    try:
        airtable_clients = Airtable(AIRTABLE_BASE_ID, "Clients", api_key=AIRTABLE_API_KEY)
    except Exception as e:
        print(f"Warning: Could not connect to Clients table: {e}")

# Cache for client names to avoid repeated API calls
client_name_cache = {}

# Pydantic models
class Record(BaseModel):
    id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lastVisit: Optional[str] = None
    nextAppointment: Optional[str] = None
    preferredService: Optional[str] = None
    totalVisits: Optional[int] = 0
    totalSpent: Optional[float] = 0.0
    tags: Optional[List[str]] = []
    notes: Optional[str] = None
    createdAt: Optional[str] = None

class RecordCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    lastVisit: Optional[str] = None
    nextAppointment: Optional[str] = None
    preferredService: Optional[str] = None
    totalVisits: Optional[int] = 0
    totalSpent: Optional[float] = 0.0
    tags: Optional[List[str]] = []
    notes: Optional[str] = None

class RecordUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lastVisit: Optional[str] = None
    nextAppointment: Optional[str] = None
    preferredService: Optional[str] = None
    totalVisits: Optional[int] = None
    totalSpent: Optional[float] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Airtable Dashboard API is running!"}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    airtable_status = "connected" if airtable else "not configured"
    return {
        "status": "healthy",
        "airtable": airtable_status,
        "api_key_configured": bool(AIRTABLE_API_KEY),
        "base_id_configured": bool(AIRTABLE_BASE_ID),
        "table_name": TABLE_NAME
    }

def map_airtable_record(record):
    """Map Airtable record to our Record model"""
    fields = record.get('fields', {})
    
    # Handle linked records and arrays for client name
    client_name = fields.get('Client Name')
    if isinstance(client_name, list) and len(client_name) > 0:
        # This is a linked record ID, we'll use the Appointment ID instead for now
        # In a full implementation, we'd fetch the linked client data
        client_display_name = fields.get('Appointment ID', f"Client {record.get('id', '')[-4:]}")
    else:
        client_display_name = fields.get('Appointment ID', f"Client {record.get('id', '')[-4:]}")
    
    # Handle services linked field
    services = fields.get('Services')
    if isinstance(services, list) and len(services) > 0:
        services_name = "Service"  # Would need to fetch linked service data for real name
    else:
        services_name = 'Service'
    
    # Handle stylist linked field  
    stylist = fields.get('Stylist')
    if isinstance(stylist, list) and len(stylist) > 0:
        stylist_name = "Stylist"  # Would need to fetch linked stylist data for real name
    else:
        stylist_name = 'Staff'
    
    return Record(
        id=record.get('id'),
        name=client_display_name,  # Use Appointment ID as display name
        email='',  # Not available in appointments table
        phone='',  # Not available in appointments table
        lastVisit=fields.get('Appointment Date'),
        nextAppointment='',  # Not available
        preferredService=services_name,
        totalVisits=1,  # Each record is one appointment
        totalSpent=fields.get('Total Price', 0),
        tags=[fields.get('Appointment Status', '')] if fields.get('Appointment Status') else [],
        notes=fields.get('Notes', ''),
        createdAt=fields.get('Appointment Date', '')
    )

@app.get("/api/records", response_model=List[Record])
async def get_records():
    """Fetch all records from Airtable"""
    if not airtable:
        # Return mock data if Airtable is not configured
        return [
            Record(
                id="mock1",
                name="Sarah Johnson",
                email="sarah@example.com",
                phone="+1 (555) 123-4567",
                lastVisit="2024-01-15",
                preferredService="Hair Cut & Color",
                totalVisits=12,
                totalSpent=1450.0,
                tags=["VIP", "Regular"],
                notes="Prefers Jessica as stylist",
                createdAt="2024-01-01T00:00:00Z"
            ),
            Record(
                id="mock2",
                name="Mike Chen",
                email="mike@example.com",
                phone="+1 (555) 987-6543",
                lastVisit="2024-01-10",
                preferredService="Beard Trim",
                totalVisits=8,
                totalSpent=320.0,
                tags=["Regular"],
                notes="Usually books on weekends",
                createdAt="2024-01-02T00:00:00Z"
            )
        ]
    
    try:
        records = airtable.get_all()
        return [map_airtable_record(record) for record in records]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching records: {str(e)}")

@app.post("/api/records", response_model=Record)
async def create_record(record: RecordCreate):
    """Create a new record in Airtable"""
    if not airtable:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        # Map to Airtable field names based on your table structure
        # Only include fields that are not computed
        airtable_fields = {
            "Appointment ID": record.name,
            "Appointment Date": record.lastVisit,
            "Appointment Status": record.tags[0] if record.tags else "Scheduled",
            "Notes": record.notes
        }
        
        # Remove None values
        airtable_fields = {k: v for k, v in airtable_fields.items() if v is not None}
        
        created_record = airtable.insert(airtable_fields)
        return map_airtable_record(created_record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating record: {str(e)}")

@app.put("/api/records/{record_id}", response_model=Record)
async def update_record(record_id: str, record: RecordUpdate):
    """Update a record in Airtable"""
    if not airtable:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        # Map to Airtable field names
        airtable_fields = {}
        if record.name is not None:
            airtable_fields["Name"] = record.name
        if record.email is not None:
            airtable_fields["Email"] = record.email
        if record.phone is not None:
            airtable_fields["Phone"] = record.phone
        if record.lastVisit is not None:
            airtable_fields["Last Visit"] = record.lastVisit
        if record.nextAppointment is not None:
            airtable_fields["Next Appointment"] = record.nextAppointment
        if record.preferredService is not None:
            airtable_fields["Preferred Service"] = record.preferredService
        if record.totalVisits is not None:
            airtable_fields["Total Visits"] = record.totalVisits
        if record.totalSpent is not None:
            airtable_fields["Total Spent"] = record.totalSpent
        if record.tags is not None:
            airtable_fields["Tags"] = record.tags
        if record.notes is not None:
            airtable_fields["Notes"] = record.notes
        
        updated_record = airtable.update(record_id, airtable_fields)
        return map_airtable_record(updated_record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating record: {str(e)}")

@app.delete("/api/records/{record_id}")
async def delete_record(record_id: str):
    """Delete a record from Airtable"""
    if not airtable:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        airtable.delete(record_id)
        return {"message": "Record deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting record: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)