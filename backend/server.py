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
airtable_services = None
airtable_employees = None

if AIRTABLE_API_KEY and AIRTABLE_BASE_ID and AIRTABLE_API_KEY != "your_airtable_api_key_here" and AIRTABLE_BASE_ID != "your_airtable_base_id_here":
    airtable = Airtable(AIRTABLE_BASE_ID, TABLE_NAME, api_key=AIRTABLE_API_KEY)
    # Also connect to related tables
    try:
        airtable_clients = Airtable(AIRTABLE_BASE_ID, "Clients", api_key=AIRTABLE_API_KEY)
        airtable_services = Airtable(AIRTABLE_BASE_ID, "Services", api_key=AIRTABLE_API_KEY)
        airtable_employees = Airtable(AIRTABLE_BASE_ID, "Employees", api_key=AIRTABLE_API_KEY)
    except Exception as e:
        print(f"Warning: Could not connect to related tables: {e}")

# Cache for names to avoid repeated API calls
client_name_cache = {}
service_name_cache = {}
employee_name_cache = {}

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

# Cache for client names to avoid repeated API calls
client_name_cache = {}

def get_client_name(client_id):
    """Fetch real client name from Clients table"""
    if not airtable_clients or not client_id:
        return None
        
    if client_id in client_name_cache:
        return client_name_cache[client_id]
    
    try:
        client_record = airtable_clients.get(client_id)
        client_name = client_record['fields'].get('Client Name', '')
        client_name_cache[client_id] = client_name
        return client_name
    except Exception as e:
        print(f"Error fetching client {client_id}: {e}")
        return None

def get_service_name(service_id):
    """Fetch real service name from Services table"""
    if not airtable_services or not service_id:
        return None
        
    if service_id in service_name_cache:
        return service_name_cache[service_id]
    
    try:
        service_record = airtable_services.get(service_id)
        service_name = service_record['fields'].get('Service Name') or service_record['fields'].get('Name', '')
        service_name_cache[service_id] = service_name
        return service_name
    except Exception as e:
        print(f"Error fetching service {service_id}: {e}")
        return None

def get_employee_name(employee_id):
    """Fetch real employee name from Employees table"""
    if not airtable_employees or not employee_id:
        return None
        
    if employee_id in employee_name_cache:
        return employee_name_cache[employee_id]
    
    try:
        employee_record = airtable_employees.get(employee_id)
        fields = employee_record['fields']
        full_name = fields.get('Full Name', '')
        first_name = fields.get('First Name', '')
        last_name = fields.get('Last Name', '')
        employee_name = full_name or f'{first_name} {last_name}'.strip() or 'Unknown Therapist'
        employee_name_cache[employee_id] = employee_name
        return employee_name
    except Exception as e:
        print(f"Error fetching employee {employee_id}: {e}")
        return None

def map_airtable_record(record):
    """Map Airtable record to our Record model"""
    fields = record.get('fields', {})
    
    # Handle linked records and get real names
    client_name = "Unknown Client"
    client_ids = fields.get('Client Name')
    if isinstance(client_ids, list) and len(client_ids) > 0:
        real_client_name = get_client_name(client_ids[0])
        if real_client_name:
            client_name = real_client_name
        else:
            client_name = fields.get('Appointment ID', f"Client {record.get('id', '')[-4:]}")
    else:
        client_name = fields.get('Appointment ID', f"Client {record.get('id', '')[-4:]}")
    
    # Handle services linked field
    service_name = "Service"
    service_ids = fields.get('Services')
    if isinstance(service_ids, list) and len(service_ids) > 0:
        real_service_name = get_service_name(service_ids[0])
        if real_service_name:
            service_name = real_service_name
    
    # Handle employee/therapist linked field  
    therapist_name = "Therapist"
    employee_ids = fields.get('Stylist')
    if isinstance(employee_ids, list) and len(employee_ids) > 0:
        real_employee_name = get_employee_name(employee_ids[0])
        if real_employee_name:
            therapist_name = real_employee_name
    
    return Record(
        id=record.get('id'),
        name=client_name,
        email=therapist_name,  # Using email field to store therapist name
        phone=fields.get('Appointment Time', ''),  # Using phone field to store time
        lastVisit=fields.get('Appointment Date'),
        nextAppointment='',  # Not available
        preferredService=service_name,
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

@app.get("/api/clients")
async def get_clients():
    """Get list of available clients for dropdown"""
    if not airtable_clients:
        return []
    
    try:
        clients = airtable_clients.get_all()
        client_list = []
        for client in clients:
            name = client['fields'].get('Client Name', 'Unnamed Client')
            client_list.append({
                "id": client['id'],
                "name": name
            })
        return client_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching clients: {str(e)}")

@app.get("/api/services")
async def get_services():
    """Get list of available services for dropdown"""
    if not airtable_services:
        return []
    
    try:
        services = airtable_services.get_all()
        service_list = []
        for service in services:
            name = service['fields'].get('Service Name') or service['fields'].get('Name', 'Unnamed Service')
            service_list.append({
                "id": service['id'],
                "name": name
            })
        return service_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching services: {str(e)}")

@app.get("/api/employees")
async def get_employees():
    """Get list of available therapists/employees for dropdown"""
    if not airtable_employees:
        return []
    
    try:
        employees = airtable_employees.get_all()
        employee_list = []
        for emp in employees:
            full_name = emp['fields'].get('Full Name', '')
            first_name = emp['fields'].get('First Name', '')
            last_name = emp['fields'].get('Last Name', '')
            name = full_name or f'{first_name} {last_name}'.strip() or 'Unnamed Therapist'
            employee_list.append({
                "id": emp['id'],
                "name": name
            })
        return employee_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employees: {str(e)}")

@app.post("/api/appointments")
async def create_appointment(appointment_data: dict):
    """Create a new appointment in Airtable"""
    if not airtable:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        # Generate next appointment ID
        existing_appointments = airtable.get_all()
        appointment_ids = [apt['fields'].get('Appointment ID', '') for apt in existing_appointments if apt['fields'].get('Appointment ID')]
        
        # Find highest number and increment
        max_num = 0
        for apt_id in appointment_ids:
            if apt_id.startswith('A') and apt_id[1:].isdigit():
                max_num = max(max_num, int(apt_id[1:]))
        
        new_appointment_id = f"A{max_num + 1:03d}"
        
        # Map to Airtable field names with linked records
        airtable_fields = {
            "Appointment ID": new_appointment_id,
            "Client Name": [appointment_data["client_id"]],  # Linked record
            "Services": [appointment_data["service_id"]],     # Linked record
            "Stylist": [appointment_data["employee_id"]],     # Linked record
            "Appointment Date": appointment_data["date"],
            "Appointment Time": appointment_data.get("time", "10:00 AM"),
            "Appointment Status": "Scheduled",
            "Notes": appointment_data.get("notes", "")
        }
        
        created_record = airtable.insert(airtable_fields)
        return {
            "success": True,
            "appointment_id": new_appointment_id,
            "record_id": created_record['id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating appointment: {str(e)}")

@app.put("/api/appointments/{appointment_id}")
async def update_appointment(appointment_id: str, update_data: dict):
    """Update or cancel an appointment in Airtable"""
    if not airtable:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        action = update_data.get('action', 'update')
        
        if action == 'cancel':
            # Update status to Cancelled
            airtable_fields = {
                "Appointment Status": "Cancelled"
            }
        else:
            # Update appointment details
            airtable_fields = {}
            
            if update_data.get('date'):
                airtable_fields["Appointment Date"] = update_data["date"]
            if update_data.get('time'):
                airtable_fields["Appointment Time"] = update_data["time"]
            if update_data.get('status'):
                airtable_fields["Appointment Status"] = update_data["status"]
            if update_data.get('notes'):
                airtable_fields["Notes"] = update_data["notes"]
            if update_data.get('client_id'):
                airtable_fields["Client Name"] = [update_data["client_id"]]
            if update_data.get('service_id'):
                airtable_fields["Services"] = [update_data["service_id"]]
            if update_data.get('employee_id'):
                airtable_fields["Stylist"] = [update_data["employee_id"]]
        
        updated_record = airtable.update(appointment_id, airtable_fields)
        return {
            "success": True,
            "action": action,
            "record_id": updated_record['id']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating appointment: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)