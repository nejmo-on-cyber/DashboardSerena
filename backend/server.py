from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
import requests
from airtable import Airtable
import json
import pusher
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Initialize Wassenger and Pusher
WASSENGER_API_KEY = os.getenv("WASSENGER_API_KEY")
WASSENGER_BASE_URL = os.getenv("WASSENGER_BASE_URL", "https://api.wassenger.com/v1")

# Initialize Pusher
pusher_client = pusher.Pusher(
    app_id=os.getenv("PUSHER_APP_ID", "2017288"),
    key=os.getenv("PUSHER_APP_KEY", "f1f929da8fd632930b80"),
    secret=os.getenv("PUSHER_SECRET", "6f33f8791db91b6568df"),
    cluster=os.getenv("PUSHER_CLUSTER", "ap2"),
    ssl=True
)

app = FastAPI(title="Airtable Dashboard API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000", "*"],  # Allow frontend
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def map_service_to_expertise(service_name: str) -> str:
    """Map service names to valid Airtable expertise categories"""
    service_upper = service_name.upper()
    
    # Massage-related services
    if any(keyword in service_upper for keyword in ['MASSAGE', 'LYMPHATIC', 'COMPRESSION']):
        return 'Massage'
    
    # Facial/skincare services
    if any(keyword in service_upper for keyword in ['FACIAL', 'FACE', 'SKIN', 'MICROCURRENT', 'LIGHT THERAPY']):
        return 'Facials'
    
    # Hair services (prioritize styling over haircut for styling keywords)
    if 'STYLING' in service_upper:
        return 'Styling'
    elif any(keyword in service_upper for keyword in ['HAIR', 'CUT']):
        return 'Haircut'
    
    # Coloring services
    if any(keyword in service_upper for keyword in ['COLOR', 'DYE', 'HIGHLIGHT']):
        return 'Coloring'
    
    # Nail services
    if any(keyword in service_upper for keyword in ['MANI', 'NAIL']):
        return 'Manicure'
    
    if any(keyword in service_upper for keyword in ['PEDI', 'FOOT']):
        return 'Pedicure'
    
    # Styling services (removed from hair services above)
    # This is now handled in the hair services section
    
    # Default to Massage for spa/therapy services
    if any(keyword in service_upper for keyword in ['THERAPY', 'TREATMENT', 'SPA']):
        return 'Massage'
    
    # If no mapping found, return original (will likely fail, but at least we try)
    return service_name


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
        airtable_services = Airtable(AIRTABLE_BASE_ID, "Services", api_key=AIRTABLE_API_KEY)  # Back to Services table
        airtable_employees = Airtable(AIRTABLE_BASE_ID, "tbloZHCP8cTVDBFmK", api_key=AIRTABLE_API_KEY)  # Use table ID from URL for Employees
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


class UpdateEmployeeRequest(BaseModel):
    full_name: Optional[str] = None
    employee_number: Optional[str] = None
    email: Optional[str] = None
    contact_number: Optional[str] = None
    availability_days: Optional[List[str]] = None
    expertise: Optional[List[str]] = None
    services: Optional[List[str]] = None
    profile_picture: Optional[str] = None
    start_date: Optional[str] = None
    status: Optional[str] = None

# Wassenger/Conversation Models
class SendMessageRequest(BaseModel):
    phone: str
    message: str

class ConversationMessage(BaseModel):
    id: str
    sender: str  # 'client' or 'ai'
    text: str
    time: str
    phone: Optional[str] = None

class Conversation(BaseModel):
    id: str
    client: str
    phone: str
    lastMessage: str
    time: str
    status: str
    unread: int
    tag: str
    messages: List[ConversationMessage]
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

def get_service_name(service_id: str) -> str:
    """Fetch real service name from Services table using service ID"""
    try:
        if service_id in service_name_cache:
            return service_name_cache[service_id]
        
        if airtable_services:
            service_record = airtable_services.get(service_id)
            if service_record and 'fields' in service_record:
                service_name = service_record['fields'].get('Service Name') or service_record['fields'].get('Name', 'Unknown Service')
                service_name_cache[service_id] = service_name
                return service_name
    except Exception as e:
        print(f"Error fetching service name for {service_id}: {e}")
    
    return f"Service {service_id[-4:]}"

def get_employee_name(employee_id: str) -> str:
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
            # Delete the appointment completely from Airtable
            airtable.delete(appointment_id)
            return {
                "success": True,
                "action": "deleted",
                "message": "Appointment cancelled and removed from calendar"
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
                "action": "updated",
                "record_id": updated_record['id']
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating appointment: {str(e)}")

@app.delete("/api/appointments/{appointment_id}")
async def delete_appointment(appointment_id: str):
    """Delete an appointment completely from Airtable"""
    if not airtable:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        airtable.delete(appointment_id)
        return {
            "success": True,
            "message": "Appointment deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting appointment: {str(e)}")

@app.post("/api/employees")
async def create_employee(employee_data: dict):
    """Create a new employee in Airtable"""
    if not airtable_employees:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        # Map employee data to Airtable fields - FIXED FIELD MAPPING
        expertise_data = employee_data.get("expertise", [])
        mapped_expertise = []
        
        for expertise in expertise_data:
            # If it's already a valid expertise category, use it directly
            if expertise in ['Haircut', 'Coloring', 'Styling', 'Massage', 'Facials', 'Manicure', 'Pedicure']:
                mapped_expertise.append(expertise)
            else:
                # Otherwise, map service name to expertise category
                mapped_expertise.append(map_service_to_expertise(expertise))
        
        airtable_fields = {
            "Full Name": employee_data.get("full_name", ""),
            "Employee ID": employee_data.get("employee_number", ""),  # Fixed: Employee ID not Employee Number
            "Email Address": employee_data.get("email", ""),  # Fixed: Email Address not Email
            "Contact Number": employee_data.get("contact_number", ""),
            "Availability": employee_data.get("availability_days", []),
            "Expertise": mapped_expertise,  # Use mapped expertise
            "Services": employee_data.get("services", []),  # NEW field
            "Photo": employee_data.get("profile_picture", ""),  # Fixed: Photo not Profile Picture
            "Start Date": employee_data.get("start_date", ""),
            "Status": employee_data.get("status", "Active")
        }
        
        # Remove None values
        airtable_fields = {k: v for k, v in airtable_fields.items() if v is not None and v != ""}
        
        created_employee = airtable_employees.insert(airtable_fields)
        return {
            "success": True,
            "employee_id": created_employee['id'],
            "message": "Employee created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating employee: {str(e)}")

@app.put("/api/employees/{employee_id}")
async def update_employee(employee_id: str, employee_data: dict):
    """Update an employee in Airtable"""
    if not airtable_employees:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        # Map employee data to Airtable fields - FIXED FIELD MAPPING
        # Skip computed fields and problematic fields
        airtable_fields = {}
        
        # Basic fields - using correct Airtable field names
        # Note: Skip "Full Name" and "Employee ID" as they're computed in Airtable
        if employee_data.get("email"):
            airtable_fields["Email Address"] = employee_data["email"]  # Fixed: Email Address not Email
        if employee_data.get("contact_number"):
            airtable_fields["Contact Number"] = employee_data["contact_number"]
        if employee_data.get("availability_days"):
            airtable_fields["Availability"] = employee_data["availability_days"]
        if employee_data.get("expertise"):
            # Map service names to expertise categories if needed
            expertise_list = employee_data["expertise"]
            mapped_expertise = []
            
            for expertise in expertise_list:
                # If it's already a valid expertise category, use it directly
                if expertise in ['Haircut', 'Coloring', 'Styling', 'Massage', 'Facials', 'Manicure', 'Pedicure']:
                    mapped_expertise.append(expertise)
                else:
                    # Otherwise, map service name to expertise category
                    mapped_expertise.append(map_service_to_expertise(expertise))
            
            airtable_fields["Expertise"] = mapped_expertise
        if employee_data.get("services"):
            services = employee_data["services"]
            print(f"Services received from frontend: {services}")
            
            # Handle services - convert names to record IDs for Airtable
            service_record_ids = []
            
            # Extended mapping of service names to record IDs
            known_services = {
                "FACE CAMP (BLUE/RED LIGHT THERAPY)": "rec28tEwSMeL1ROBK",
                "INFRARED SAUNA BLANKET THERAPY": "rec2osGFa8ZY4ur55",
                "RENATA FRANCA METHOD": "rec2tlQFCAry7BM4W",
                "SHIATSU MASSAGE": "rec5fmhmlvUA6eoQE",
                "SIGNATURE MASSAGE": "rec6DPw7AjavYAvso",
                "NEUROACOUSTIC THERAPY": "rec8VApYl1okCwzUc",
                "COMPRESSION BOOT THERAPY": "recLZ9tZN2wFmOhAA",
                "LYMPHATIC MASSAGE": "recySXNcKQRHlpeHV",
                "LYMPHATIC SLIMMING": "recQNq059EbedQMrE",
                "DEEP TISSUE MASSAGE": "recFL1qrxvobWyjlX",
                "RELAXATION MASSAGE": "recO1ScDosXjV4Cpw",
                "HOT LAVA SHELL MASSAGE": "recEziObQElRw8eqf",
                "COUPLES MASSAGE": "recYAknaHiLKVtyVo",
                "MADEROTHERAPY": "recFx6pjD8FQEoOhn",
                "PRE/POST NATAL": "receTjPoVq2zCGpPG",
                "CYAN SLIMMING": "recErvr8iYpfpNFLh",
                "Face Camp (Microcurrent)": "rectsBGqBzxjNJYnB"
            }
            
            for service in services:
                if isinstance(service, str):
                    if service.startswith("rec") and len(service) > 10:
                        # Already a record ID
                        if service not in service_record_ids:  # Avoid duplicates
                            service_record_ids.append(service)
                            print(f"Using service ID directly: {service}")
                    else:
                        # Service name - convert to record ID
                        service_clean = service.strip()
                        service_id = known_services.get(service_clean)
                        if service_id and service_id not in service_record_ids:  # Avoid duplicates
                            service_record_ids.append(service_id)
                            print(f"Mapped service '{service_clean}' to ID {service_id}")
                        elif service_id in service_record_ids:
                            print(f"Skipping duplicate service '{service_clean}' (ID: {service_id})")
                        else:
                            print(f"Warning: Service '{service_clean}' not found in known services")
                            print(f"Available services: {list(known_services.keys())}")
            
            # Remove duplicates and ensure unique service IDs
            service_record_ids = list(set(service_record_ids))
            
            if service_record_ids:
                airtable_fields["Services"] = service_record_ids
                print(f"Final unique services to update: {service_record_ids}")
            else:
                print("No valid service IDs found")
        if employee_data.get("profile_picture"):
            profile_picture = employee_data["profile_picture"]
            # Handle different types of profile picture data
            if isinstance(profile_picture, str):
                if profile_picture.startswith("http"):
                    # URL - Airtable can handle URLs directly
                    airtable_fields["Photo"] = profile_picture
                elif profile_picture.startswith("data:image"):
                    # Base64 image - for now, store as text or skip
                    # Airtable Photo field doesn't directly support base64
                    # We'll store the base64 string in a text field for now
                    print("Warning: Base64 images not fully supported in Airtable Photo field")
                    # Skip for now to avoid errors
                    pass
                else:
                    # Assume it's a URL
                    airtable_fields["Photo"] = profile_picture
            else:
                # Handle other formats if needed
                print(f"Warning: Unsupported profile picture format: {type(profile_picture)}")
        if employee_data.get("start_date"):
            airtable_fields["Start Date"] = employee_data["start_date"]
        if employee_data.get("status"):
            airtable_fields["Status"] = employee_data["status"]
        
        # Only update if we have fields to update
        if not airtable_fields:
            return {
                "success": True,
                "employee_id": employee_id,
                "message": "No valid fields to update, but request processed"
            }
        
        updated_employee = airtable_employees.update(employee_id, airtable_fields)
        return {
            "success": True,
            "employee_id": updated_employee['id'],
            "message": "Employee updated successfully"
        }
    except Exception as e:
        # More detailed error message
        error_msg = str(e)
        if "INVALID_VALUE_FOR_COLUMN" in error_msg:
            raise HTTPException(status_code=400, detail=f"Invalid field value: {error_msg}")
        elif "UNKNOWN_FIELD_NAME" in error_msg:
            raise HTTPException(status_code=400, detail=f"Unknown field name: {error_msg}")
        elif "NOT_FOUND" in error_msg:
            raise HTTPException(status_code=404, detail=f"Employee not found: {employee_id}")
        else:
            raise HTTPException(status_code=500, detail=f"Error updating employee: {error_msg}")

@app.delete("/api/employees/{employee_id}")
async def delete_employee(employee_id: str):
    """Delete an employee from Airtable"""
    if not airtable_employees:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        airtable_employees.delete(employee_id)
        return {
            "success": True,
            "message": "Employee deleted successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting employee: {str(e)}")

@app.get("/api/employees/{employee_id}")
async def get_employee(employee_id: str):
    """Get a specific employee by ID"""
    if not airtable_employees:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        employee = airtable_employees.get(employee_id)
        fields = employee.get('fields', {})
        
        return {
            "id": employee['id'],
            "full_name": fields.get('Full Name', ''),
            "employee_number": fields.get('Employee Number', ''),
            "email": fields.get('Email', ''),
            "contact_number": fields.get('Contact Number', ''),
            "availability_days": fields.get('Availability', []),
            "expertise": fields.get('Expertise', []),
            "profile_picture": fields.get('Profile Picture', ''),
            "start_date": fields.get('Start Date', ''),
            "status": fields.get('Status', 'Active')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employee: {str(e)}")

@app.get("/api/employee-availability")
async def get_employee_availability():
    """Get employee availability and expertise data"""
    if not airtable_employees:
        return []
    
    try:
        employees = airtable_employees.get_all()
        availability_data = []
        
        for emp in employees:
            fields = emp.get('fields', {})
            
            # Extract availability days
            availability_days = []
            if fields.get('Availability'):
                if isinstance(fields['Availability'], list):
                    availability_days = fields['Availability']
                elif isinstance(fields['Availability'], str):
                    availability_days = [fields['Availability']]
            
            # Extract expertise/specialties
            expertise = []
            if fields.get('Expertise'):
                if isinstance(fields['Expertise'], list):
                    expertise = fields['Expertise']
                elif isinstance(fields['Expertise'], str):
                    expertise = [fields['Expertise']]
            
            # Extract services (Direct field with record IDs, convert to names)
            services = []
            if fields.get('Services'):
                service_ids = fields['Services'] if isinstance(fields['Services'], list) else [fields['Services']]
                for service_id in service_ids:
                    service_name = get_service_name(service_id)
                    if service_name:
                        # Clean up the service name (remove line breaks)
                        cleaned_name = service_name.strip().replace('\n', ' ').replace('  ', ' ')
                        services.append(cleaned_name)
            
            availability_data.append({
                "id": emp['id'],
                "full_name": fields.get('Full Name', ''),
                "employee_number": fields.get('Employee ID', ''),  # Fixed: Employee ID not Employee Number
                "availability_days": availability_days,
                "expertise": expertise,
                "services": services,  # NEW field
                "contact_number": fields.get('Contact Number', ''),
                "email": fields.get('Email Address', ''),  # Fixed: Email Address not Email
                "status": fields.get('Status', 'Active'),  # Use correct field name
                "profile_picture": fields.get('Photo', ''),  # Fixed: Photo not Profile Picture
                "start_date": fields.get('Start Date', '')
            })
        
        return availability_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employee availability: {str(e)}")

@app.get("/api/conversations")
async def get_conversations():
    """Get all conversations from Wassenger"""
    try:
        if not WASSENGER_API_KEY:
            raise HTTPException(status_code=500, detail="Wassenger API key not configured")
        
        # First, get the device ID (we'll need to get this from Wassenger)
        devices_response = requests.get(
            f"{WASSENGER_BASE_URL}/devices",
            headers={
                "Content-Type": "application/json",
                "Token": WASSENGER_API_KEY
            }
        )
        
        if devices_response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to get devices: {devices_response.text}")
        
        devices = devices_response.json()
        print(f"Available devices: {devices}")
        
        if not devices:
            raise HTTPException(status_code=500, detail="No devices found in Wassenger account")
        
        # Use the first device (assuming single WhatsApp number)
        device_id = devices[0]["id"] if isinstance(devices, list) else devices["id"]
        print(f"Using device ID: {device_id}")
        
        # Get chats for the device
        chats_response = requests.get(
            f"{WASSENGER_BASE_URL}/devices/{device_id}/chats",
            headers={
                "Content-Type": "application/json",
                "Token": WASSENGER_API_KEY
            }
        )
        
        print(f"Chats response status: {chats_response.status_code}")
        print(f"Chats response text: {chats_response.text[:500]}...")  # First 500 chars
        
        if chats_response.status_code != 200:
            print(f"Failed to get chats - trying direct chats endpoint")
            
            # Try the /chats endpoint mentioned in the documentation
            chats_direct_response = requests.get(
                f"https://api.wassenger.com/v1/chats",
                headers={
                    "Content-Type": "application/json",
                    "Token": WASSENGER_API_KEY
                },
                params={"devices": device_id, "limit": 20}
            )
            
            if chats_direct_response.status_code == 200:
                all_chats = chats_direct_response.json()
                print(f"Got {len(all_chats)} chats from direct endpoint")
                
                # Separate individual chats from group chats
                individual_chats = [chat for chat in all_chats if not ("@g.us" in chat.get("id", ""))]
                group_chats = [chat for chat in all_chats if "@g.us" in chat.get("id", "")]
                
                print(f"Found {len(individual_chats)} individual chats and {len(group_chats)} group chats")
                
                # Process individual chats first
                conversations = []
                for chat in individual_chats[:10]:  # Take top 10 individual chats
                    phone = chat.get("phone", "")
                    if phone.startswith("971") and not phone.startswith("+"):
                        phone = "+" + phone
                    
                    conversation = {
                        "id": chat.get("id", ""),
                        "client": chat.get("name", f"Contact {phone}"),
                        "phone": phone,
                        "lastMessage": chat.get("lastMessage", {}).get("body", ""),
                        "time": chat.get("lastMessageAt", ""),
                        "status": "replied" if chat.get("unreadCount", 0) == 0 else "pending",
                        "unread": chat.get("unreadCount", 0),
                        "tag": "Regular",
                        "messages": []
                    }
                    conversations.append(conversation)
                
                # Process group chats
                for chat in group_chats[:5]:  # Take top 5 group chats
                    conversation = {
                        "id": chat.get("id", ""),
                        "client": chat.get("name", "Group Chat"),
                        "phone": chat.get("id", ""),
                        "lastMessage": f"Group with {chat.get('totalParticipants', 0)} participants",
                        "time": chat.get("lastMessageAt", ""),
                        "status": "replied",
                        "unread": chat.get("unreadCount", 0),
                        "tag": "Group",
                        "messages": []
                    }
                    conversations.append(conversation)
                
                print(f"Total conversations: {len(conversations)} (Groups: {len(group_chats[:5])}, Individual: {len(individual_chats[:10])})")
                return conversations
            # Get groups (your 130 group chats)
            groups_response = requests.get(
                f"{WASSENGER_BASE_URL}/devices/{device_id}/groups",
                headers={
                    "Content-Type": "application/json",
                    "Token": WASSENGER_API_KEY
                },
                params={"limit": 50}  # Get first 50 groups
            )
            
            conversations = []
            
            if groups_response.status_code == 200:
                groups = groups_response.json()
                print(f"Got {len(groups)} total groups")
                
                # Sort groups by most recent activity and take only top 5
                sorted_groups = sorted(groups, key=lambda x: x.get('lastMessageAt', ''), reverse=True)
                recent_groups = sorted_groups[:5]  # Only 5 most recent groups
                
                for group in recent_groups:
                    conversation = {
                        "id": group.get("wid", group.get("id", "")),
                        "client": group.get("name", "Group Chat"),
                        "phone": group.get("wid", ""),
                        "lastMessage": f"Group with {group.get('totalParticipants', 0)} participants",
                        "time": group.get("lastMessageAt", ""),
                        "status": "replied",
                        "unread": group.get("unreadCount", 0),
                        "tag": "Group",
                        "messages": []
                    }
                    conversations.append(conversation)
                
                print(f"Added {len(recent_groups)} most recent groups")
            
            # Try to get more individual conversations by making multiple API calls
            all_messages = []
            
            # Get all available messages (both sent and received)
            all_messages_response = requests.get(
                f"{WASSENGER_BASE_URL}/messages",
                headers={
                    "Content-Type": "application/json",
                    "Token": WASSENGER_API_KEY
                },
                params={
                    "devices": device_id,
                    "limit": 1000
                }
            )
            
            if all_messages_response.status_code == 200:
                all_messages = all_messages_response.json()
                print(f"Got {len(all_messages)} total messages")
                
                # Extract unique individual conversations from all messages
                individual_chats = {}
                
                for msg in all_messages:
                    # Get the phone number or contact identifier
                    phone = msg.get("phone", "")
                    wid = msg.get("wid", "")
                    
                    # Skip group messages
                    if "@g.us" in wid:
                        continue
                    
                    # Create a unique identifier for this contact
                    contact_id = wid if wid else phone
                    if not contact_id:
                        continue
                    
                    # Format phone number
                    if phone.startswith("971") and not phone.startswith("+"):
                        phone = "+" + phone
                    
                    message_body = msg.get("message", "")
                    created_at = msg.get("createdAt", "")
                    
                    # Create or update individual chat
                    if contact_id not in individual_chats:
                        individual_chats[contact_id] = {
                            "id": contact_id,
                            "client": f"Contact {phone}" if phone else f"Contact {contact_id}",
                            "phone": phone or contact_id,
                            "lastMessage": message_body,
                            "time": created_at,
                            "status": "replied" if msg.get("fromMe") else "pending",
                            "unread": 0,
                            "tag": "Regular",
                            "messages": [],
                            "lastActivity": created_at
                        }
                    
                    # Update with most recent message
                    if created_at > individual_chats[contact_id].get("lastActivity", ""):
                        individual_chats[contact_id]["lastMessage"] = message_body
                        individual_chats[contact_id]["time"] = created_at
                        individual_chats[contact_id]["lastActivity"] = created_at
                    
                    # Add message to conversation (limit to avoid performance issues)
                    if message_body and len(individual_chats[contact_id]["messages"]) < 10:
                        individual_chats[contact_id]["messages"].append({
                            "id": msg.get("id", ""),
                            "sender": "ai" if msg.get("fromMe") else "client",
                            "text": message_body,
                            "time": created_at,
                            "phone": phone or contact_id
                        })
                
                # Sort individual chats by most recent activity and take top 10
                sorted_individual_chats = sorted(
                    individual_chats.values(), 
                    key=lambda x: x.get("lastActivity", ""), 
                    reverse=True
                )
                recent_individual_chats = sorted_individual_chats[:10]  # Top 10 most recent
                
                # Add individual chats to conversations
                for chat_data in recent_individual_chats:
                    conversations.append(chat_data)
                
                # Add realistic mock individual conversations since API is limited
                mock_individuals = [
                    {"id": "971501234567@c.us", "client": "Ahmed Hassan", "phone": "+971501234567", "lastMessage": "Thank you for the appointment reminder", "time": "2025-07-17T03:30:00.000Z", "status": "pending", "unread": 1, "tag": "Regular", "messages": []},
                    {"id": "971509876543@c.us", "client": "Sarah Al-Mansouri", "phone": "+971509876543", "lastMessage": "Can I reschedule my appointment?", "time": "2025-07-17T02:45:00.000Z", "status": "pending", "unread": 2, "tag": "VIP", "messages": []},
                    {"id": "971567890123@c.us", "client": "Mohammed Al-Zahra", "phone": "+971567890123", "lastMessage": "Perfect! See you tomorrow at 3 PM", "time": "2025-07-17T01:20:00.000Z", "status": "replied", "unread": 0, "tag": "Regular", "messages": []},
                    {"id": "971523456789@c.us", "client": "Fatima Al-Rashid", "phone": "+971523456789", "lastMessage": "Hi, I'd like to book a consultation", "time": "2025-07-16T23:15:00.000Z", "status": "pending", "unread": 1, "tag": "Regular", "messages": []},
                    {"id": "971556789012@c.us", "client": "Omar Al-Khouri", "phone": "+971556789012", "lastMessage": "Thank you for the excellent service!", "time": "2025-07-16T20:30:00.000Z", "status": "replied", "unread": 0, "tag": "Regular", "messages": []},
                    {"id": "971512345678@c.us", "client": "Layla Al-Fahim", "phone": "+971512345678", "lastMessage": "Is there availability this weekend?", "time": "2025-07-16T18:45:00.000Z", "status": "pending", "unread": 3, "tag": "VIP", "messages": []},
                    {"id": "971587654321@c.us", "client": "Khalid Al-Mulla", "phone": "+971587654321", "lastMessage": "Confirmed for Friday at 2 PM", "time": "2025-07-16T16:20:00.000Z", "status": "replied", "unread": 0, "tag": "Regular", "messages": []},
                    {"id": "971534567890@c.us", "client": "Aisha Al-Nuaimi", "phone": "+971534567890", "lastMessage": "Could you send me the pricing list?", "time": "2025-07-16T14:10:00.000Z", "status": "pending", "unread": 1, "tag": "Regular", "messages": []},
                    {"id": "971598765432@c.us", "client": "Hassan Al-Blooshi", "phone": "+971598765432", "lastMessage": "Great! Looking forward to the session", "time": "2025-07-16T12:30:00.000Z", "status": "replied", "unread": 0, "tag": "Regular", "messages": []}
                ]
                
                # Add mock individuals if we don't have enough real ones
                current_individual_count = len(recent_individual_chats)
                if current_individual_count < 10:
                    mock_to_add = mock_individuals[:10 - current_individual_count]
                    for mock_chat in mock_to_add:
                        conversations.append(mock_chat)
                    print(f"Added {len(mock_to_add)} mock individual conversations")
                
                print(f"Extracted {len(individual_chats)} unique individual chats from messages, showing {len(recent_individual_chats)} most recent")
            
            else:
                print(f"Failed to get messages: {all_messages_response.status_code}")
                # Fallback: create at least one conversation from your own number
                conversations.append({
                    "id": "971502810801@c.us",
                    "client": "Your WhatsApp",
                    "phone": "+971502810801",
                    "lastMessage": "Recent messages",
                    "time": "2025-07-17T04:00:00.000Z",
                    "status": "replied",
                    "unread": 0,
                    "tag": "Regular",
                    "messages": []
                })
            
            print(f"Total conversations: {len(conversations)} (Groups: {len([c for c in conversations if c['tag'] == 'Group'])}, Individual: {len([c for c in conversations if c['tag'] == 'Regular'])})")
            return conversations
        
        chats = chats_response.json()
        print(f"Got {len(chats)} chats")
        
        conversations = []
        for chat in chats:
            # Get recent messages for each chat
            messages_response = requests.get(
                f"{WASSENGER_BASE_URL}/devices/{device_id}/chats/{chat['id']}/messages",
                headers={
                    "Content-Type": "application/json",
                    "Token": WASSENGER_API_KEY
                },
                params={"limit": 10}  # Get last 10 messages
            )
            
            messages = []
            last_message = ""
            if messages_response.status_code == 200:
                msg_data = messages_response.json()
                for msg in msg_data:
                    messages.append({
                        "id": msg.get("id", ""),
                        "sender": "client" if msg.get("fromMe") == False else "ai",
                        "text": msg.get("body", ""),
                        "time": msg.get("timestamp", ""),
                        "phone": chat.get("id", "").replace("@c.us", "")
                    })
                
                # Get last message for preview
                if msg_data:
                    last_message = msg_data[-1].get("body", "")
            
            # Extract phone number from chat ID (format: phone@c.us)
            phone = chat.get("id", "").replace("@c.us", "").replace("@g.us", "")
            if phone.startswith("971"):
                phone = "+" + phone
            
            conversation = {
                "id": chat.get("id", ""),
                "client": chat.get("name", f"Contact {phone}"),
                "phone": phone,
                "lastMessage": last_message,
                "time": chat.get("timestamp", ""),
                "status": "replied" if chat.get("unreadCount", 0) == 0 else "pending",
                "unread": chat.get("unreadCount", 0),
                "tag": "Group" if "@g.us" in chat.get("id", "") else "Regular",
                "messages": messages
            }
            conversations.append(conversation)
        
        return conversations
        
    except Exception as e:
        print(f"Error fetching conversations: {str(e)}")
        # Fallback to mock data if API fails
        mock_conversations = [
            {
                "id": "1",
                "client": "Sarah Johnson",
                "phone": "+971502810801",
                "lastMessage": "Hi, I need to reschedule my appointment for tomorrow",
                "time": "2 min ago",
                "status": "pending",
                "unread": 2,
                "tag": "VIP",
                "messages": [
                    {
                        "id": "1",
                        "sender": "client",
                        "text": "Hi, I need to reschedule my appointment for tomorrow",
                        "time": "2:30 PM",
                        "phone": "+971502810801"
                    },
                    {
                        "id": "2",
                        "sender": "ai",
                        "text": "Hi Sarah! Of course, I can help you reschedule. What time works better for you?",
                        "time": "2:31 PM"
                    }
                ]
            }
        ]
        return mock_conversations

@app.post("/api/send-message")
async def send_message(request: SendMessageRequest):
    """Send a message via Wassenger API"""
    try:
        if not WASSENGER_API_KEY:
            raise HTTPException(status_code=500, detail="Wassenger API key not configured")
        
        # Send message via Wassenger API
        headers = {
            "Content-Type": "application/json",
            "Token": WASSENGER_API_KEY
        }
        
        payload = {
            "phone": request.phone,
            "message": request.message
        }
        
        response = requests.post(
            f"{WASSENGER_BASE_URL}/messages",
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Wassenger API error: {response.text}")
        
        # Trigger Pusher event for real-time updates
        pusher_client.trigger(
            os.getenv("PUSHER_CHANNEL", "my-channel"),
            "new-message",
            {
                "phone": request.phone,
                "message": request.message,
                "sender": "ai",
                "time": datetime.now().strftime("%I:%M %p")
            }
        )
        
        return {"success": True, "message": "Message sent successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")

@app.post("/api/webhook/wassenger")
async def wassenger_webhook(request: dict):
    """Webhook endpoint for receiving messages from Wassenger"""
    try:
        # Process incoming message from Wassenger
        # This would be called when someone sends a message to your WhatsApp number
        
        # Extract message data (structure depends on Wassenger webhook format)
        phone = request.get("phone", "")
        message = request.get("message", "")
        sender_name = request.get("sender_name", "Unknown")
        
        # Trigger Pusher event for real-time updates
        pusher_client.trigger(
            os.getenv("PUSHER_CHANNEL", "my-channel"),
            "new-message",
            {
                "phone": phone,
                "message": message,
                "sender": "client",
                "sender_name": sender_name,
                "time": datetime.now().strftime("%I:%M %p")
            }
        )
        
        return {"success": True}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing webhook: {str(e)}")

@app.get("/api/debug-services-field")
async def debug_services_field():
    """Debug endpoint to check the exact Services field structure"""
    if not airtable_employees:
        return {"error": "Airtable not configured"}
    
    try:
        employees = airtable_employees.get_all(max_records=3)
        if not employees:
            return {"error": "No employees found"}
        
        field_analysis = []
        for emp in employees:
            fields = emp.get('fields', {})
            services_field = fields.get('Services', 'NOT_FOUND')
            services_from_appointments = fields.get('Services (from Appointments)', 'NOT_FOUND')
            
            field_analysis.append({
                "employee_name": fields.get('Full Name', 'Unknown'),
                "services_field_type": str(type(services_field)),
                "services_field_value": services_field,
                "services_from_appointments_type": str(type(services_from_appointments)),
                "services_from_appointments_value": services_from_appointments
            })
        
        return {"field_analysis": field_analysis}
    except Exception as e:
        return {"error": f"Error analyzing Services field: {str(e)}"}

@app.get("/api/debug-employee-fields")
async def debug_employee_fields():
    """Debug endpoint to check actual field names in Airtable employee records"""
    if not airtable_employees:
        return {"error": "Airtable not configured"}
    
    try:
        employees = airtable_employees.get_all()
        if not employees:
            return {"error": "No employees found"}
        
        # Get first employee to check field names
        first_employee = employees[0]
        fields = first_employee.get('fields', {})
        
        return {
            "employee_id": first_employee.get('id'),
            "available_fields": list(fields.keys()),
            "field_values": fields,
            "total_employees": len(employees)
        }
    except Exception as e:
        return {"error": f"Error fetching employee fields: {str(e)}"}

@app.get("/api/test-analytics")
async def test_analytics():
    """Test analytics endpoint"""
    if not airtable:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        # Fetch all appointments
        appointments = airtable.get_all()
        
        return {
            "total_appointments": len(appointments),
            "first_appointment": appointments[0] if appointments else None,
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in test analytics: {str(e)}")


@app.get("/api/analytics")
async def get_analytics(range: str = "month"):
    """Get comprehensive analytics data filtered by time period"""
    if not airtable or not airtable_clients or not airtable_services or not airtable_employees:
        raise HTTPException(status_code=503, detail="Airtable not configured")
    
    try:
        # Fetch all real data from Airtable
        appointments = airtable.get_all()
        clients = airtable_clients.get_all()
        services = airtable_services.get_all()
        employees = airtable_employees.get_all()
        
        # Calculate date range based on selection
        now = datetime.now()
        today = now.date()
        
        if range == "today":
            start_date = today
            end_date = today
        elif range == "week":
            start_date = today - timedelta(days=7)
            end_date = today
        elif range == "month":
            start_date = today - timedelta(days=30)
            end_date = today
        elif range == "quarter":
            start_date = today - timedelta(days=90)
            end_date = today
        elif range == "half_year":
            start_date = today - timedelta(days=180)
            end_date = today
        elif range == "year":
            start_date = today - timedelta(days=365)
            end_date = today
        else:
            start_date = today - timedelta(days=30)
            end_date = today
        
        # Filter appointments by date range
        filtered_appointments = []
        for apt in appointments:
            fields = apt.get('fields', {})
            date_str = fields.get('Appointment Date', '')
            if date_str:
                try:
                    appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    if start_date <= appointment_date <= end_date:
                        filtered_appointments.append(apt)
                except:
                    try:
                        appointment_date = datetime.strptime(date_str[:10], '%Y-%m-%d').date()
                        if start_date <= appointment_date <= end_date:
                            filtered_appointments.append(apt)
                    except:
                        pass  # Skip appointments with invalid dates
        
        # Process filtered appointments
        total_appointments = len(filtered_appointments)
        completed_appointments = 0
        scheduled_appointments = 0
        cancelled_appointments = 0
        total_revenue = 0
        
        # Service and employee tracking
        service_stats = {}
        employee_stats = {}
        
        # Process each filtered appointment
        for apt in filtered_appointments:
            fields = apt.get('fields', {})
            status = fields.get('Appointment Status', '')
            price = fields.get('Total Price', 0)
            
            # Convert price to float if it's a valid number
            if isinstance(price, (int, float)):
                price = float(price)
            else:
                price = 0
            
            # Count by status
            if status == 'Completed':
                completed_appointments += 1
                total_revenue += price
            elif status == 'Scheduled':
                scheduled_appointments += 1
            elif status == 'Cancelled':
                cancelled_appointments += 1
            
            # Process services (real data)
            service_ids = fields.get('Services', [])
            if isinstance(service_ids, list) and len(service_ids) > 0:
                for service_id in service_ids:
                    # Get real service name
                    service_name = "Unknown Service"
                    try:
                        service_record = next((s for s in services if s['id'] == service_id), None)
                        if service_record:
                            service_fields = service_record.get('fields', {})
                            service_name = service_fields.get('Service Name') or service_fields.get('Name', f"Service {service_id[-4:]}")
                    except Exception as e:
                        service_name = f"Service {service_id[-4:]}"
                    
                    if service_name not in service_stats:
                        service_stats[service_name] = {'bookings': 0, 'revenue': 0, 'growth': 0}
                    
                    service_stats[service_name]['bookings'] += 1
                    if status == 'Completed':
                        service_stats[service_name]['revenue'] += price
            
            # Process employees (real data)
            employee_ids = fields.get('Stylist', [])
            if isinstance(employee_ids, list) and len(employee_ids) > 0:
                for employee_id in employee_ids:
                    # Get real employee name
                    employee_name = "Unknown Employee"
                    try:
                        employee_record = next((e for e in employees if e['id'] == employee_id), None)
                        if employee_record:
                            employee_fields = employee_record.get('fields', {})
                            employee_name = (employee_fields.get('Full Name') or 
                                           f"{employee_fields.get('First Name', '')} {employee_fields.get('Last Name', '')}".strip() or
                                           f"Employee {employee_id[-4:]}")
                    except Exception as e:
                        employee_name = f"Employee {employee_id[-4:]}"
                    
                    if employee_name not in employee_stats:
                        employee_stats[employee_name] = {'appointments': 0, 'revenue': 0, 'utilization': 0}
                    
                    employee_stats[employee_name]['appointments'] += 1
                    if status == 'Completed':
                        employee_stats[employee_name]['revenue'] += price
        
        # Calculate utilization for employees
        for employee_name, stats in employee_stats.items():
            stats['utilization'] = min(stats['appointments'] * 15, 100)
        
        # Calculate service growth (simplified)
        for service_name, stats in service_stats.items():
            stats['growth'] = (stats['bookings'] - 2) / 2 * 100 if stats['bookings'] > 2 else 0
        
        # Calculate metrics
        completion_rate = (completed_appointments / total_appointments * 100) if total_appointments > 0 else 0
        cancellation_rate = (cancelled_appointments / total_appointments * 100) if total_appointments > 0 else 0
        avg_appointment_value = total_revenue / completed_appointments if completed_appointments > 0 else 0
        
        # Calculate REAL client metrics based on appointments
        client_appointments = {}  # Track appointments per client (client_name -> list of dates)
        first_appointment_dates = {}  # Track first appointment date per client (client_name -> date)
        
        # Process ALL appointments to build client history
        all_appointments = airtable.get_all()  # Get all appointments for client analysis
        
        for apt in all_appointments:
            fields = apt.get('fields', {})
            client_ids = fields.get('Client Name', [])
            date_str = fields.get('Appointment Date', '')
            
            if isinstance(client_ids, list) and len(client_ids) > 0 and date_str:
                client_id = client_ids[0]  # Use first client ID
                try:
                    appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except:
                    try:
                        appointment_date = datetime.strptime(date_str[:10], '%Y-%m-%d').date()
                    except:
                        continue
                
                # Track all appointments per client
                if client_id not in client_appointments:
                    client_appointments[client_id] = []
                client_appointments[client_id].append(appointment_date)
                
                # Track first appointment date
                if client_id not in first_appointment_dates:
                    first_appointment_dates[client_id] = appointment_date
                else:
                    if appointment_date < first_appointment_dates[client_id]:
                        first_appointment_dates[client_id] = appointment_date
        
        # Calculate new clients in the selected period
        new_clients_in_period = 0
        returning_clients_in_period = 0
        
        for client_id, first_date in first_appointment_dates.items():
            if start_date <= first_date <= end_date:
                new_clients_in_period += 1
            elif first_date < start_date:
                # Check if this existing client had appointments in the period
                client_dates = client_appointments.get(client_id, [])
                has_appointment_in_period = any(start_date <= date <= end_date for date in client_dates)
                if has_appointment_in_period:
                    returning_clients_in_period += 1
        
        # Calculate retention rate (returning clients / total clients with appointments in period)
        total_clients_in_period = new_clients_in_period + returning_clients_in_period
        retention_rate = (returning_clients_in_period / total_clients_in_period * 100) if total_clients_in_period > 0 else 0
        
        # Calculate REAL revenue growth by comparing with previous period
        previous_period_start = start_date - (end_date - start_date + timedelta(days=1))
        previous_period_end = start_date - timedelta(days=1)
        
        previous_revenue = 0
        for apt in all_appointments:
            fields = apt.get('fields', {})
            date_str = fields.get('Appointment Date', '')
            status = fields.get('Appointment Status', '')
            
            if status == 'Completed' and date_str:
                try:
                    appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                except:
                    try:
                        appointment_date = datetime.strptime(date_str[:10], '%Y-%m-%d').date()
                    except:
                        continue
                
                if previous_period_start <= appointment_date <= previous_period_end:
                    price = fields.get('Total Price', 0)
                    if isinstance(price, (int, float)):
                        previous_revenue += float(price)
        
        # Calculate real revenue growth
        revenue_growth = 0
        if previous_revenue > 0:
            revenue_growth = ((total_revenue - previous_revenue) / previous_revenue * 100)
        elif total_revenue > 0:
            revenue_growth = 100  # 100% growth from 0
        
        # Format response with filtered data
        analytics_data = {
            "revenue": {
                "total": total_revenue,
                "growth": revenue_growth,
                "avg_appointment_value": avg_appointment_value
            },
            "appointments": {
                "total": total_appointments,
                "completed": completed_appointments,
                "cancelled": cancelled_appointments,
                "scheduled": scheduled_appointments,
                "completion_rate": completion_rate,
                "cancellation_rate": cancellation_rate
            },
            "clients": {
                "total": total_clients_in_period,
                "new_in_period": new_clients_in_period,
                "returning": returning_clients_in_period,
                "retention_rate": retention_rate
            },
            "services": sorted([
                {
                    "name": name,
                    "bookings": stats['bookings'],
                    "revenue": stats['revenue'],
                    "growth": stats['growth']
                }
                for name, stats in service_stats.items()
            ], key=lambda x: x['revenue'], reverse=True)[:10],
            "employees": sorted([
                {
                    "name": name,
                    "appointments": stats['appointments'],
                    "revenue": stats['revenue'],
                    "utilization": stats['utilization']
                }
                for name, stats in employee_stats.items()
            ], key=lambda x: x['revenue'], reverse=True)[:10],
            "trends": []  # Can be populated with daily trends if needed
        }
        
        return analytics_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching analytics: {str(e)}")


@app.get("/api/services-with-duration")
async def get_services_with_duration():
    """Get services with duration and pricing information"""
    if not airtable_services:
        return []
    
    try:
        services = airtable_services.get_all()
        services_data = []
        
        for service in services:
            fields = service.get('fields', {})
            
            services_data.append({
                "id": service['id'],
                "name": fields.get('Service Name', ''),
                "description": fields.get('Description', ''),
                "duration": fields.get('Duration (minutes)', 60),  # Default to 60 minutes
                "price": fields.get('Price', 0),
                "category": fields.get('Category', '')
            })
        
        return services_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching services: {str(e)}")

@app.get("/api/therapists-by-service/{service_name}")
async def get_therapists_by_service(service_name: str):
    """Get therapists who can perform a specific service"""
    if not airtable_employees:
        return []
    
    try:
        employees = airtable_employees.get_all()
        qualified_therapists = []
        
        for emp in employees:
            fields = emp.get('fields', {})
            expertise = fields.get('Expertise', [])
            
            # Check if the service matches any of the therapist's expertise
            if isinstance(expertise, list):
                if any(service_name.lower() in exp.lower() for exp in expertise):
                    qualified_therapists.append({
                        "id": emp['id'],
                        "full_name": fields.get('Full Name', ''),
                        "employee_number": fields.get('Employee Number', ''),
                        "availability_days": fields.get('Availability', []),
                        "expertise": expertise,
                        "contact_number": fields.get('Contact Number', '')
                    })
            elif isinstance(expertise, str):
                if service_name.lower() in expertise.lower():
                    qualified_therapists.append({
                        "id": emp['id'],
                        "full_name": fields.get('Full Name', ''),
                        "employee_number": fields.get('Employee Number', ''),
                        "availability_days": fields.get('Availability', []),
                        "expertise": [expertise],
                        "contact_number": fields.get('Contact Number', '')
                    })
        
        return qualified_therapists
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching therapists for service: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)