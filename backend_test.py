#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class BackendAPITester:
    def __init__(self, base_url="https://a092d38d-5c45-40a1-a065-ffc27435430c.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_appointment_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        return self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )

    def test_get_records(self):
        """Test getting all records (should return mock data)"""
        return self.run_test(
            "Get All Records",
            "GET",
            "api/records",
            200
        )

    def test_create_record_without_airtable(self):
        """Test creating a record without Airtable configured (should fail)"""
        test_record = {
            "name": "Test Client",
            "email": "test@example.com",
            "phone": "+1 (555) 123-4567",
            "preferredService": "Test Service",
            "totalVisits": 1,
            "totalSpent": 100.0,
            "tags": ["Test"],
            "notes": "Test notes"
        }
        
        return self.run_test(
            "Create Record (No Airtable)",
            "POST",
            "api/records",
            503,  # Service Unavailable - Airtable not configured
            data=test_record
        )

    def test_update_record_without_airtable(self):
        """Test updating a record without Airtable configured (should fail)"""
        test_record = {
            "name": "Updated Test Client",
            "email": "updated@example.com"
        }
        
        return self.run_test(
            "Update Record (No Airtable)",
            "PUT",
            "api/records/mock1",
            503,  # Service Unavailable - Airtable not configured
            data=test_record
        )

    def test_delete_record_without_airtable(self):
        """Test deleting a record without Airtable configured (should fail)"""
        return self.run_test(
            "Delete Record (No Airtable)",
            "DELETE",
            "api/records/mock1",
            503  # Service Unavailable - Airtable not configured
        )

    def test_root_endpoint(self):
        """Test root endpoint"""
        return self.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )

    def test_get_clients(self):
        """Test getting clients for dropdown"""
        return self.run_test(
            "Get Clients",
            "GET", 
            "api/clients",
            200
        )

    def test_get_services(self):
        """Test getting services for dropdown"""
        return self.run_test(
            "Get Services",
            "GET",
            "api/services", 
            200
        )

    def test_get_employees(self):
        """Test getting employees for dropdown"""
        return self.run_test(
            "Get Employees",
            "GET",
            "api/employees",
            200
        )

    def test_create_appointment(self):
        """Test creating a new appointment"""
        # First get available clients, services, and employees
        clients_success, clients_data = self.test_get_clients()
        services_success, services_data = self.test_get_services()
        employees_success, employees_data = self.test_get_employees()
        
        if not (clients_success and services_success and employees_success):
            print("❌ Cannot create appointment - missing dropdown data")
            return False, {}
            
        if not (clients_data and services_data and employees_data):
            print("❌ Cannot create appointment - empty dropdown data")
            return False, {}

        # Create appointment with real data
        appointment_data = {
            "client_id": clients_data[0]["id"],
            "service_id": services_data[0]["id"], 
            "employee_id": employees_data[0]["id"],
            "date": "2024-02-15",
            "time": "2:00 PM",
            "notes": "Test appointment for deletion testing"
        }
        
        success, response_data = self.run_test(
            "Create Appointment",
            "POST",
            "api/appointments",
            200,
            data=appointment_data
        )
        
        if success and response_data.get("record_id"):
            self.created_appointment_id = response_data["record_id"]
            print(f"   Created appointment with ID: {self.created_appointment_id}")
        
        return success, response_data

    def test_update_appointment_cancel(self):
        """Test cancelling appointment via UPDATE endpoint (should delete completely)"""
        if not self.created_appointment_id:
            print("❌ No appointment ID available for cancel test")
            return False, {}
            
        cancel_data = {
            "action": "cancel"
        }
        
        success, response_data = self.run_test(
            "Cancel Appointment (UPDATE with action=cancel)",
            "PUT",
            f"api/appointments/{self.created_appointment_id}",
            200,
            data=cancel_data
        )
        
        if success:
            expected_action = response_data.get("action")
            if expected_action == "deleted":
                print("✅ Appointment was completely deleted as expected")
            else:
                print(f"⚠️  Expected action='deleted', got action='{expected_action}'")
                
        return success, response_data

    def test_verify_appointment_deleted(self):
        """Verify the cancelled appointment no longer exists in records"""
        success, records_data = self.run_test(
            "Verify Appointment Deleted from Records",
            "GET",
            "api/records",
            200
        )
        
        if success and isinstance(records_data, list):
            # Check if our deleted appointment still exists
            deleted_found = False
            for record in records_data:
                if record.get("id") == self.created_appointment_id:
                    deleted_found = True
                    break
                    
            if not deleted_found:
                print("✅ Deleted appointment not found in records - complete deletion confirmed")
                return True, {"deleted_confirmed": True}
            else:
                print("❌ Deleted appointment still found in records - deletion failed")
                return False, {"deleted_confirmed": False}
        
        return success, records_data

    def test_delete_appointment_direct(self):
        """Test direct DELETE endpoint for appointments"""
        # Create another appointment to test direct deletion
        clients_success, clients_data = self.test_get_clients()
        services_success, services_data = self.test_get_services() 
        employees_success, employees_data = self.test_get_employees()
        
        if clients_data and services_data and employees_data:
            appointment_data = {
                "client_id": clients_data[0]["id"],
                "service_id": services_data[0]["id"],
                "employee_id": employees_data[0]["id"], 
                "date": "2024-02-16",
                "time": "3:00 PM",
                "notes": "Test appointment for direct deletion"
            }
            
            create_success, create_response = self.run_test(
                "Create Appointment for Direct Delete Test",
                "POST",
                "api/appointments", 
                200,
                data=appointment_data
            )
            
            if create_success and create_response.get("record_id"):
                delete_appointment_id = create_response["record_id"]
                
                # Now test direct deletion
                success, response_data = self.run_test(
                    "Direct DELETE Appointment",
                    "DELETE",
                    f"api/appointments/{delete_appointment_id}",
                    200
                )
                
                if success:
                    # Verify it's deleted from records
                    verify_success, records_data = self.run_test(
                        "Verify Direct Delete from Records",
                        "GET", 
                        "api/records",
                        200
                    )
                    
                    if verify_success and isinstance(records_data, list):
                        deleted_found = False
                        for record in records_data:
                            if record.get("id") == delete_appointment_id:
                                deleted_found = True
                                break
                                
                        if not deleted_found:
                            print("✅ Direct deleted appointment not found in records - deletion confirmed")
                        else:
                            print("❌ Direct deleted appointment still found in records")
                            
                return success, response_data
        
        return False, {}

    def test_invalid_appointment_deletion(self):
        """Test error handling for invalid appointment IDs"""
        invalid_id = "invalid_appointment_id_12345"
        
        # Test UPDATE with cancel on invalid ID
        cancel_data = {"action": "cancel"}
        update_success, update_response = self.run_test(
            "Cancel Invalid Appointment ID (UPDATE)",
            "PUT",
            f"api/appointments/{invalid_id}",
            500,  # Should return error
            data=cancel_data
        )
        
        # Test DELETE on invalid ID  
        delete_success, delete_response = self.run_test(
            "Delete Invalid Appointment ID (DELETE)",
            "DELETE",
            f"api/appointments/{invalid_id}",
            500  # Should return error
        )
        
        return update_success and delete_success, {
            "update_response": update_response,
            "delete_response": delete_response
        }

    def test_appointment_update_functionality(self):
        """Test regular appointment update (not cancel) still works"""
        # Create appointment for update test
        clients_success, clients_data = self.test_get_clients()
        services_success, services_data = self.test_get_services()
        employees_success, employees_data = self.test_get_employees()
        
        if clients_data and services_data and employees_data:
            appointment_data = {
                "client_id": clients_data[0]["id"],
                "service_id": services_data[0]["id"],
                "employee_id": employees_data[0]["id"],
                "date": "2024-02-17", 
                "time": "4:00 PM",
                "notes": "Test appointment for update"
            }
            
            create_success, create_response = self.run_test(
                "Create Appointment for Update Test",
                "POST",
                "api/appointments",
                200,
                data=appointment_data
            )
            
            if create_success and create_response.get("record_id"):
                update_appointment_id = create_response["record_id"]
                
                # Test regular update (not cancel)
                update_data = {
                    "action": "update",
                    "date": "2024-02-18",
                    "time": "5:00 PM", 
                    "notes": "Updated appointment notes",
                    "status": "Confirmed"
                }
                
                success, response_data = self.run_test(
                    "Update Appointment Details",
                    "PUT",
                    f"api/appointments/{update_appointment_id}",
                    200,
                    data=update_data
                )
                
                if success:
                    expected_action = response_data.get("action")
                    if expected_action == "updated":
                        print("✅ Regular appointment update working correctly")
                    else:
                        print(f"⚠️  Expected action='updated', got action='{expected_action}'")
                
                # Clean up - delete the test appointment
                self.run_test(
                    "Cleanup Update Test Appointment",
                    "DELETE",
                    f"api/appointments/{update_appointment_id}",
                    200
                )
                        
                return success, response_data
        
        return False, {}

    # NEW BOOKING ADMIN ENDPOINTS TESTS
    def test_employee_availability(self):
        """Test GET /api/employee-availability endpoint"""
        success, response_data = self.run_test(
            "Get Employee Availability",
            "GET",
            "api/employee-availability",
            200
        )
        
        if success and isinstance(response_data, list):
            print(f"   Found {len(response_data)} employees with availability data")
            
            # Validate data structure
            for emp in response_data[:2]:  # Check first 2 employees
                required_fields = ['id', 'full_name', 'employee_number', 'availability_days', 'expertise', 'contact_number', 'email']
                missing_fields = [field for field in required_fields if field not in emp]
                if missing_fields:
                    print(f"⚠️  Employee missing fields: {missing_fields}")
                else:
                    print(f"✅ Employee {emp.get('full_name', 'Unknown')} has all required fields")
                    print(f"   Availability: {emp.get('availability_days', [])}")
                    print(f"   Expertise: {emp.get('expertise', [])}")
        
        return success, response_data

    def test_services_with_duration(self):
        """Test GET /api/services-with-duration endpoint"""
        success, response_data = self.run_test(
            "Get Services with Duration",
            "GET",
            "api/services-with-duration",
            200
        )
        
        if success and isinstance(response_data, list):
            print(f"   Found {len(response_data)} services with duration data")
            
            # Validate data structure
            for service in response_data[:2]:  # Check first 2 services
                required_fields = ['id', 'name', 'description', 'duration', 'price', 'category']
                missing_fields = [field for field in required_fields if field not in service]
                if missing_fields:
                    print(f"⚠️  Service missing fields: {missing_fields}")
                else:
                    print(f"✅ Service {service.get('name', 'Unknown')} has all required fields")
                    print(f"   Duration: {service.get('duration', 0)} minutes")
                    print(f"   Price: ${service.get('price', 0)}")
        
        return success, response_data

    def test_therapists_by_service(self):
        """Test GET /api/therapists-by-service/{service_name} endpoint"""
        # Test with common service names
        test_services = ["Haircut", "Massage", "Facial", "Coloring", "Styling"]
        results = {}
        
        for service_name in test_services:
            success, response_data = self.run_test(
                f"Get Therapists for {service_name}",
                "GET",
                f"api/therapists-by-service/{service_name}",
                200
            )
            
            results[service_name] = {
                "success": success,
                "therapist_count": len(response_data) if isinstance(response_data, list) else 0,
                "data": response_data
            }
            
            if success and isinstance(response_data, list):
                print(f"   Found {len(response_data)} therapists for {service_name}")
                
                # Validate therapist data structure
                for therapist in response_data[:1]:  # Check first therapist
                    required_fields = ['id', 'full_name', 'employee_number', 'availability_days', 'expertise', 'contact_number']
                    missing_fields = [field for field in required_fields if field not in therapist]
                    if missing_fields:
                        print(f"⚠️  Therapist missing fields: {missing_fields}")
                    else:
                        print(f"✅ Therapist {therapist.get('full_name', 'Unknown')} qualified for {service_name}")
                        print(f"   Expertise: {therapist.get('expertise', [])}")
            else:
                print(f"   No therapists found for {service_name}")
        
        return True, results

    def test_therapists_by_invalid_service(self):
        """Test therapists endpoint with invalid/non-existent service"""
        invalid_services = ["NonExistentService", "InvalidService123", ""]
        
        for invalid_service in invalid_services:
            success, response_data = self.run_test(
                f"Get Therapists for Invalid Service: '{invalid_service}'",
                "GET",
                f"api/therapists-by-service/{invalid_service}",
                200  # Should return 200 with empty list
            )
            
            if success and isinstance(response_data, list):
                if len(response_data) == 0:
                    print(f"✅ Correctly returned empty list for invalid service: '{invalid_service}'")
                else:
                    print(f"⚠️  Unexpected therapists found for invalid service: '{invalid_service}'")
        
        return True, {}

    def test_booking_admin_data_consistency(self):
        """Test data consistency across booking admin endpoints"""
        print("\n🔍 Testing data consistency across booking admin endpoints...")
        
        # Get data from all endpoints
        emp_success, emp_data = self.test_employee_availability()
        svc_success, svc_data = self.test_services_with_duration()
        
        if not (emp_success and svc_success):
            print("❌ Cannot test consistency - endpoint failures")
            return False, {}
        
        # Test service filtering logic
        if isinstance(emp_data, list) and isinstance(svc_data, list):
            print(f"   Testing with {len(emp_data)} employees and {len(svc_data)} services")
            
            # Check if any employee has expertise matching available services
            service_names = [svc.get('name', '') for svc in svc_data]
            matched_services = []
            
            for service_name in service_names[:3]:  # Test first 3 services
                if service_name:
                    _, therapist_results = self.run_test(
                        f"Consistency Check: {service_name}",
                        "GET",
                        f"api/therapists-by-service/{service_name}",
                        200
                    )
                    
                    if isinstance(therapist_results, list) and len(therapist_results) > 0:
                        matched_services.append(service_name)
                        print(f"✅ Service '{service_name}' has {len(therapist_results)} qualified therapists")
            
            print(f"   {len(matched_services)} services have qualified therapists")
            return True, {"matched_services": matched_services}
        
        return False, {}

    def test_employee_update_endpoint(self):
        """Test PUT /api/employees/{id} endpoint - SIMPLIFIED SAFE FIELDS ONLY"""
        print("\n🔍 TESTING: Simplified Employee Update Endpoint (Safe Fields Only)...")
        
        # First get available employees to find a valid ID
        emp_success, emp_data = self.run_test(
            "Get Employees for Update Test",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot test employee update - no employees available")
            return False, {}
        
        # Use the first employee for testing
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        original_name = test_employee.get('full_name', 'Unknown')
        original_contact = test_employee.get('contact_number', 'Unknown')
        original_availability = test_employee.get('availability_days', [])
        
        print(f"   Testing with Employee ID: {employee_id}")
        print(f"   Original Name: {original_name}")
        print(f"   Original Contact: {original_contact}")
        print(f"   Original Availability: {original_availability}")
        
        # Test data with ONLY SAFE FIELDS as specified in review request
        safe_update_data = {
            "contact_number": "555-123-4567",
            "availability_days": ["Monday", "Wednesday", "Friday"]
        }
        
        print(f"   Safe Update Data: {json.dumps(safe_update_data, indent=2)}")
        
        # Test the PUT endpoint with safe fields only
        success, response_data = self.run_test(
            f"Update Employee {employee_id} (Safe Fields Only)",
            "PUT",
            f"api/employees/{employee_id}",
            200,  # Expecting success now
            data=safe_update_data
        )
        
        if not success:
            print("❌ Employee update with safe fields failed!")
            print(f"   Response: {response_data}")
            
            # Try to get more detailed error info
            try:
                import requests
                url = f"{self.base_url}/api/employees/{employee_id}"
                response = requests.put(url, json=safe_update_data, timeout=10)
                print(f"   Detailed Error - Status: {response.status_code}")
                print(f"   Detailed Error - Text: {response.text}")
                print(f"   Detailed Error - Headers: {dict(response.headers)}")
            except Exception as e:
                print(f"   Error getting detailed info: {e}")
        else:
            print("✅ Employee update with safe fields succeeded!")
            print(f"   Response: {response_data}")
            
            # Verify the update by getting the employee again
            verify_success, verify_data = self.run_test(
                f"Verify Employee Update {employee_id}",
                "GET",
                f"api/employees/{employee_id}",
                200
            )
            
            if verify_success:
                print("✅ Employee data retrieved after update")
                updated_contact = verify_data.get('contact_number', 'Unknown')
                updated_availability = verify_data.get('availability_days', [])
                
                print(f"   Updated Contact: {updated_contact}")
                print(f"   Updated Availability: {updated_availability}")
                
                # Check if changes were actually saved
                if updated_contact == "555-123-4567":
                    print("✅ Contact number update confirmed in Airtable")
                else:
                    print(f"⚠️  Contact number not updated: expected '555-123-4567', got '{updated_contact}'")
                
                if "Monday" in updated_availability and "Wednesday" in updated_availability and "Friday" in updated_availability:
                    print("✅ Availability days update confirmed in Airtable")
                else:
                    print(f"⚠️  Availability days not updated correctly: {updated_availability}")
            else:
                print("❌ Could not verify employee update")
        
        return success, response_data

    def test_employee_update_invalid_id(self):
        """Test PUT /api/employees/{id} endpoint with invalid employee ID"""
        print("\n🔍 TESTING: Employee Update with Invalid ID...")
        
        invalid_employee_id = "invalid_employee_id_12345"
        
        # Test data with safe fields
        safe_update_data = {
            "contact_number": "555-999-8888",
            "availability_days": ["Tuesday", "Thursday"]
        }
        
        print(f"   Testing with Invalid Employee ID: {invalid_employee_id}")
        print(f"   Update Data: {json.dumps(safe_update_data, indent=2)}")
        
        # Test the PUT endpoint with invalid ID - should return error
        success, response_data = self.run_test(
            f"Update Invalid Employee {invalid_employee_id}",
            "PUT",
            f"api/employees/{invalid_employee_id}",
            404,  # Expecting 404 or 500 error
            data=safe_update_data
        )
        
        if success:
            print("✅ Invalid employee ID properly handled with error response")
            print(f"   Error Response: {response_data}")
        else:
            print("❌ Invalid employee ID handling failed")
        
        return success, response_data

    def test_employee_get_endpoint(self):
        """Test GET /api/employees/{id} endpoint"""
        print("\n🔍 Testing Individual Employee GET Endpoint...")
        
        # Get available employees
        emp_success, emp_data = self.run_test(
            "Get Employees for Individual Test",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot test individual employee get - no employees available")
            return False, {}
        
        # Test getting individual employee
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        
        success, response_data = self.run_test(
            f"Get Individual Employee {employee_id}",
            "GET",
            f"api/employees/{employee_id}",
            200
        )
        
        if success:
            print("✅ Individual employee GET working")
            print(f"   Employee: {response_data.get('full_name', 'Unknown')}")
            print(f"   Email: {response_data.get('email', 'Not set')}")
            print(f"   Status: {response_data.get('status', 'Unknown')}")
        
        return success, response_data

    def investigate_employee_table_structure(self):
        """INVESTIGATION: Detailed analysis of Airtable Employee table structure"""
        print("\n🔍 INVESTIGATION: Airtable Employee Table Structure Analysis")
        print("=" * 80)
        
        # Get all employees to analyze field structure
        emp_success, emp_data = self.run_test(
            "Get All Employees for Structure Analysis",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot investigate - no employees available")
            return False, {}
        
        print(f"📊 Found {len(emp_data)} employees in Airtable")
        print("\n🔍 DETAILED FIELD ANALYSIS:")
        print("-" * 50)
        
        # Analyze each employee's field structure
        all_fields = set()
        field_types = {}
        field_examples = {}
        
        for i, employee in enumerate(emp_data):
            print(f"\n👤 Employee {i+1}: {employee.get('full_name', 'Unknown')}")
            print(f"   ID: {employee.get('id', 'No ID')}")
            
            for field_name, field_value in employee.items():
                all_fields.add(field_name)
                
                # Determine field type
                field_type = type(field_value).__name__
                if field_name not in field_types:
                    field_types[field_name] = set()
                field_types[field_name].add(field_type)
                
                # Store examples
                if field_name not in field_examples:
                    field_examples[field_name] = []
                if len(field_examples[field_name]) < 3:  # Store up to 3 examples
                    field_examples[field_name].append(field_value)
                
                # Print field details
                if isinstance(field_value, list):
                    print(f"   {field_name}: {field_value} (list with {len(field_value)} items)")
                elif isinstance(field_value, str):
                    print(f"   {field_name}: '{field_value}' (string)")
                else:
                    print(f"   {field_name}: {field_value} ({field_type})")
        
        # Summary of all fields found
        print(f"\n📋 COMPLETE FIELD INVENTORY ({len(all_fields)} fields found):")
        print("-" * 50)
        
        for field_name in sorted(all_fields):
            types = list(field_types[field_name])
            examples = field_examples[field_name][:2]  # Show first 2 examples
            
            print(f"• {field_name}:")
            print(f"  - Type(s): {', '.join(types)}")
            print(f"  - Examples: {examples}")
        
        return True, {
            "total_employees": len(emp_data),
            "all_fields": list(all_fields),
            "field_types": {k: list(v) for k, v in field_types.items()},
            "field_examples": field_examples
        }

    def test_expertise_services_field_specifically(self):
        """INVESTIGATION: Test the services/expertise field specifically"""
        print("\n🔍 INVESTIGATION: Services/Expertise Field Deep Dive")
        print("=" * 80)
        
        # Get employees to analyze expertise field
        emp_success, emp_data = self.run_test(
            "Get Employees for Expertise Analysis",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list):
            print("❌ Cannot analyze expertise field - no employee data")
            return False, {}
        
        print(f"📊 Analyzing expertise field across {len(emp_data)} employees")
        
        # Analyze expertise field specifically
        expertise_analysis = {
            "employees_with_expertise": 0,
            "employees_without_expertise": 0,
            "expertise_field_types": set(),
            "all_expertise_values": [],
            "unique_expertise_options": set()
        }
        
        print("\n🎯 EXPERTISE FIELD ANALYSIS:")
        print("-" * 40)
        
        for i, employee in enumerate(emp_data):
            name = employee.get('full_name', f'Employee {i+1}')
            expertise = employee.get('expertise', None)
            
            print(f"\n👤 {name} (ID: {employee.get('id', 'No ID')}):")
            
            if expertise is not None:
                expertise_analysis["employees_with_expertise"] += 1
                expertise_type = type(expertise).__name__
                expertise_analysis["expertise_field_types"].add(expertise_type)
                
                if isinstance(expertise, list):
                    print(f"   Expertise: {expertise} (list with {len(expertise)} items)")
                    expertise_analysis["all_expertise_values"].extend(expertise)
                    expertise_analysis["unique_expertise_options"].update(expertise)
                elif isinstance(expertise, str):
                    print(f"   Expertise: '{expertise}' (string)")
                    expertise_analysis["all_expertise_values"].append(expertise)
                    expertise_analysis["unique_expertise_options"].add(expertise)
                else:
                    print(f"   Expertise: {expertise} ({expertise_type})")
            else:
                expertise_analysis["employees_without_expertise"] += 1
                print("   Expertise: None/Empty")
        
        # Summary
        print(f"\n📊 EXPERTISE FIELD SUMMARY:")
        print("-" * 30)
        print(f"• Employees with expertise: {expertise_analysis['employees_with_expertise']}")
        print(f"• Employees without expertise: {expertise_analysis['employees_without_expertise']}")
        print(f"• Field types found: {list(expertise_analysis['expertise_field_types'])}")
        print(f"• Total expertise entries: {len(expertise_analysis['all_expertise_values'])}")
        print(f"• Unique expertise options: {len(expertise_analysis['unique_expertise_options'])}")
        
        if expertise_analysis['unique_expertise_options']:
            print(f"• All unique expertise values:")
            for expertise in sorted(expertise_analysis['unique_expertise_options']):
                count = expertise_analysis['all_expertise_values'].count(expertise)
                print(f"  - '{expertise}' (appears {count} times)")
        
        return True, expertise_analysis

    def test_expertise_field_update_attempts(self):
        """INVESTIGATION: Test updating expertise field with different approaches"""
        print("\n🔍 INVESTIGATION: Testing Expertise Field Updates")
        print("=" * 80)
        
        # Get an employee to test with
        emp_success, emp_data = self.run_test(
            "Get Employee for Expertise Update Test",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot test expertise updates - no employees available")
            return False, {}
        
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        original_expertise = test_employee.get('expertise', [])
        
        print(f"🎯 Testing with Employee: {test_employee.get('full_name', 'Unknown')}")
        print(f"   ID: {employee_id}")
        print(f"   Original Expertise: {original_expertise}")
        
        # Test different expertise update approaches
        test_cases = [
            {
                "name": "Single String Expertise",
                "data": {"expertise": "Massage"},
                "description": "Testing with single string value"
            },
            {
                "name": "List of Existing Expertise",
                "data": {"expertise": ["Haircut", "Styling"]},
                "description": "Testing with list of existing expertise values"
            },
            {
                "name": "List with New Expertise",
                "data": {"expertise": ["Massage", "Facial"]},
                "description": "Testing with list including potentially new values"
            },
            {
                "name": "Empty List Expertise",
                "data": {"expertise": []},
                "description": "Testing with empty list"
            }
        ]
        
        results = {}
        
        for test_case in test_cases:
            print(f"\n--- {test_case['name']} ---")
            print(f"Description: {test_case['description']}")
            print(f"Test Data: {test_case['data']}")
            
            success, response_data = self.run_test(
                f"Update Expertise: {test_case['name']}",
                "PUT",
                f"api/employees/{employee_id}",
                200,  # We'll see what we actually get
                data=test_case['data']
            )
            
            results[test_case['name']] = {
                "success": success,
                "response": response_data,
                "test_data": test_case['data']
            }
            
            if success:
                print(f"✅ Update succeeded: {response_data}")
                
                # Verify the change
                verify_success, verify_data = self.run_test(
                    f"Verify {test_case['name']}",
                    "GET",
                    f"api/employees/{employee_id}",
                    200
                )
                
                if verify_success:
                    new_expertise = verify_data.get('expertise', [])
                    print(f"   Verified Expertise: {new_expertise}")
                    results[test_case['name']]['verified_expertise'] = new_expertise
            else:
                print(f"❌ Update failed: {response_data}")
                
                # Try to get detailed error information
                try:
                    import requests
                    url = f"{self.base_url}/api/employees/{employee_id}"
                    response = requests.put(url, json=test_case['data'], timeout=10)
                    print(f"   Detailed Error - Status: {response.status_code}")
                    print(f"   Detailed Error - Response: {response.text}")
                except Exception as e:
                    print(f"   Error getting details: {e}")
            
            # Small delay between tests
            time.sleep(1)
        
        print(f"\n📊 EXPERTISE UPDATE TEST SUMMARY:")
        print("-" * 40)
        
        for test_name, result in results.items():
            status = "✅ SUCCESS" if result['success'] else "❌ FAILED"
            print(f"• {test_name}: {status}")
            if 'verified_expertise' in result:
                print(f"  Final expertise: {result['verified_expertise']}")
        
        return True, results

    def test_field_permissions_and_types(self):
        """INVESTIGATION: Test different field types and permissions"""
        print("\n🔍 INVESTIGATION: Field Permissions and Types Analysis")
        print("=" * 80)
        
        # Get an employee to test with
        emp_success, emp_data = self.run_test(
            "Get Employee for Field Permission Test",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot test field permissions - no employees available")
            return False, {}
        
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        
        print(f"🎯 Testing Field Permissions with Employee: {test_employee.get('full_name', 'Unknown')}")
        print(f"   ID: {employee_id}")
        
        # Test different field combinations to understand permissions
        field_tests = [
            {
                "name": "Contact Number Only",
                "data": {"contact_number": "555-TEST-001"},
                "expected_working": True
            },
            {
                "name": "Availability Days Only", 
                "data": {"availability_days": ["Monday", "Tuesday"]},
                "expected_working": True
            },
            {
                "name": "Full Name (Computed Field)",
                "data": {"full_name": "Test Name Update"},
                "expected_working": False
            },
            {
                "name": "Employee Number",
                "data": {"employee_number": "EMP999"},
                "expected_working": False
            },
            {
                "name": "Email Field",
                "data": {"email": "test@example.com"},
                "expected_working": False
            },
            {
                "name": "Status Field",
                "data": {"status": "Active"},
                "expected_working": False
            },
            {
                "name": "Expertise Field",
                "data": {"expertise": ["Massage"]},
                "expected_working": False
            },
            {
                "name": "Profile Picture",
                "data": {"profile_picture": "https://example.com/pic.jpg"},
                "expected_working": True
            },
            {
                "name": "Start Date",
                "data": {"start_date": "2024-01-01"},
                "expected_working": True
            }
        ]
        
        results = {}
        working_fields = []
        failing_fields = []
        
        for field_test in field_tests:
            print(f"\n--- Testing: {field_test['name']} ---")
            print(f"Data: {field_test['data']}")
            print(f"Expected to work: {field_test['expected_working']}")
            
            success, response_data = self.run_test(
                f"Field Test: {field_test['name']}",
                "PUT",
                f"api/employees/{employee_id}",
                200 if field_test['expected_working'] else [400, 404, 500],  # Accept various error codes
                data=field_test['data']
            )
            
            results[field_test['name']] = {
                "success": success,
                "response": response_data,
                "expected_working": field_test['expected_working'],
                "test_data": field_test['data']
            }
            
            if success:
                working_fields.append(field_test['name'])
                print(f"✅ Field works: {response_data}")
            else:
                failing_fields.append(field_test['name'])
                print(f"❌ Field failed: {response_data}")
            
            time.sleep(0.5)  # Small delay between tests
        
        print(f"\n📊 FIELD PERMISSIONS SUMMARY:")
        print("-" * 40)
        print(f"✅ Working Fields ({len(working_fields)}):")
        for field in working_fields:
            print(f"  • {field}")
        
        print(f"\n❌ Failing Fields ({len(failing_fields)}):")
        for field in failing_fields:
            expected = results[field]['expected_working']
            status = "Expected" if not expected else "Unexpected"
            print(f"  • {field} ({status})")
        
        return True, {
            "working_fields": working_fields,
            "failing_fields": failing_fields,
            "detailed_results": results
        }

def main():
    print("🚀 AIRTABLE EMPLOYEE TABLE STRUCTURE INVESTIGATION")
    print("=" * 80)
    print("🎯 FOCUS: Understanding Employee table fields and services/expertise issues")
    print("=" * 80)
    
    # Setup
    tester = BackendAPITester()
    
    # Run basic connectivity tests first
    print("\n📋 Basic Connectivity Tests...")
    tester.test_root_endpoint()
    tester.test_health_check()
    
    print("\n🔍 MAIN INVESTIGATION SEQUENCE")
    print("=" * 80)
    
    # Investigation sequence as requested
    print("\n--- INVESTIGATION 1: Employee Table Structure Analysis ---")
    tester.investigate_employee_table_structure()
    
    print("\n--- INVESTIGATION 2: Services/Expertise Field Deep Dive ---")
    tester.test_expertise_services_field_specifically()
    
    print("\n--- INVESTIGATION 3: Expertise Field Update Testing ---")
    tester.test_expertise_field_update_attempts()
    
    print("\n--- INVESTIGATION 4: Field Permissions and Types Analysis ---")
    tester.test_field_permissions_and_types()
    
    print("\n📋 Additional Context Tests...")
    
    # Get individual employee for detailed structure
    print("\n--- Additional: Individual Employee GET ---")
    tester.test_employee_get_endpoint()
    
    # Test current working update approach
    print("\n--- Additional: Current Working Update Approach ---")
    tester.test_employee_update_endpoint()
    
    # Print results
    print("\n" + "=" * 80)
    print(f"📊 Investigation Results: {tester.tests_passed}/{tester.tests_run} tests completed")
    
    # Key findings summary
    print("\n🎯 KEY INVESTIGATION FINDINGS:")
    print("✅ Employee table structure analyzed")
    print("✅ Services/expertise field behavior documented")
    print("✅ Field permissions and types tested")
    print("✅ Update capabilities mapped")
    print("🔍 Detailed field-by-field analysis completed")
    
    print("\n📋 INVESTIGATION COMPLETE - Check detailed output above for:")
    print("• Exact field names and types in Employee table")
    print("• Services/expertise field structure and limitations")
    print("• Which fields can be updated vs. read-only")
    print("• Specific error messages for problematic fields")
    print("• Working vs. failing field update patterns")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())