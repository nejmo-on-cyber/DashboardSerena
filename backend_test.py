#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class BackendAPITester:
    def __init__(self, base_url="https://3b39f804-d061-44da-947b-4dd2abd9a8fc.preview.emergentagent.com"):
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

    def investigate_service_names_vs_expertise_mismatch(self):
        """CRITICAL INVESTIGATION: Service names vs expertise field mismatch causing 500 errors"""
        print("\n🚨 CRITICAL INVESTIGATION: Service Names vs Expertise Field Mismatch")
        print("=" * 80)
        print("🎯 GOAL: Identify exact mismatch between frontend service options and backend expertise field")
        print("📋 USER ISSUE: Frontend shows services like 'COMPRESSION BOOT THERAPY', 'SHIATSU MASSAGE', 'COUPLES MASSAGE'")
        print("📋 BACKEND ISSUE: Only ['Haircut', 'Styling', 'Coloring', 'Facials', 'Manicure', 'Pedicure', 'Massage'] work")
        print("=" * 80)
        
        # Step 1: Get services from /api/services (what frontend shows)
        print("\n🔍 STEP 1: Getting services from /api/services (what frontend displays)")
        print("-" * 60)
        
        services_success, services_data = self.run_test(
            "Get Services from /api/services",
            "GET",
            "api/services",
            200
        )
        
        frontend_service_names = []
        if services_success and isinstance(services_data, list):
            print(f"✅ Found {len(services_data)} services from /api/services:")
            for i, service in enumerate(services_data):
                service_name = service.get('name', 'Unknown Service')
                frontend_service_names.append(service_name)
                print(f"   {i+1:2d}. '{service_name}' (ID: {service.get('id', 'No ID')})")
        else:
            print("❌ Failed to get services from /api/services")
            return False, {}
        
        # Step 2: Get expertise options from employee table (what Airtable accepts)
        print(f"\n🔍 STEP 2: Getting expertise options from employee table (what Airtable accepts)")
        print("-" * 60)
        
        emp_success, emp_data = self.run_test(
            "Get Employee Expertise Options",
            "GET",
            "api/employee-availability",
            200
        )
        
        expertise_options = set()
        if emp_success and isinstance(emp_data, list):
            print(f"✅ Found {len(emp_data)} employees, analyzing expertise fields:")
            for i, employee in enumerate(emp_data):
                name = employee.get('full_name', f'Employee {i+1}')
                expertise = employee.get('expertise', [])
                print(f"   👤 {name}: {expertise}")
                if isinstance(expertise, list):
                    expertise_options.update(expertise)
                elif isinstance(expertise, str) and expertise:
                    expertise_options.add(expertise)
        else:
            print("❌ Failed to get employee expertise data")
            return False, {}
        
        expertise_options = sorted(list(expertise_options))
        print(f"\n📊 UNIQUE EXPERTISE OPTIONS IN AIRTABLE ({len(expertise_options)} total):")
        for i, option in enumerate(expertise_options):
            print(f"   {i+1:2d}. '{option}'")
        
        # Step 3: Compare and identify mismatches
        print(f"\n🔍 STEP 3: Comparing service names vs expertise options")
        print("-" * 60)
        
        # Find services that match expertise options (case-insensitive)
        matching_services = []
        mismatched_services = []
        
        for service_name in frontend_service_names:
            # Check for exact match (case-insensitive)
            exact_match = None
            for expertise in expertise_options:
                if service_name.lower() == expertise.lower():
                    exact_match = expertise
                    break
            
            # Check for partial match (service name contains expertise or vice versa)
            partial_match = None
            if not exact_match:
                for expertise in expertise_options:
                    if expertise.lower() in service_name.lower() or service_name.lower() in expertise.lower():
                        partial_match = expertise
                        break
            
            if exact_match:
                matching_services.append({
                    "service": service_name,
                    "expertise": exact_match,
                    "match_type": "exact"
                })
            elif partial_match:
                matching_services.append({
                    "service": service_name,
                    "expertise": partial_match,
                    "match_type": "partial"
                })
            else:
                mismatched_services.append(service_name)
        
        # Step 4: Report findings
        print(f"\n📊 MISMATCH ANALYSIS RESULTS:")
        print("=" * 50)
        
        print(f"\n✅ MATCHING SERVICES ({len(matching_services)} found):")
        if matching_services:
            for match in matching_services:
                print(f"   • '{match['service']}' → '{match['expertise']}' ({match['match_type']} match)")
        else:
            print("   None found!")
        
        print(f"\n❌ MISMATCHED SERVICES ({len(mismatched_services)} found):")
        if mismatched_services:
            for service in mismatched_services:
                print(f"   • '{service}' (NO MATCHING EXPERTISE OPTION)")
        else:
            print("   None found!")
        
        # Step 5: Test actual employee updates with mismatched services
        print(f"\n🔍 STEP 4: Testing employee updates with mismatched service names")
        print("-" * 60)
        
        if emp_data and len(emp_data) > 0:
            test_employee = emp_data[0]
            employee_id = test_employee.get('id')
            original_expertise = test_employee.get('expertise', [])
            
            print(f"🎯 Testing with Employee: {test_employee.get('full_name', 'Unknown')}")
            print(f"   Original Expertise: {original_expertise}")
            
            # Test with a few mismatched service names
            test_mismatched_services = mismatched_services[:3]  # Test first 3
            
            for service_name in test_mismatched_services:
                print(f"\n--- Testing Update with Mismatched Service: '{service_name}' ---")
                
                update_data = {
                    "expertise": [service_name]
                }
                
                success, response_data = self.run_test(
                    f"Update Employee with '{service_name}'",
                    "PUT",
                    f"api/employees/{employee_id}",
                    [200, 400, 500],  # Accept various responses
                    data=update_data
                )
                
                if success:
                    print(f"✅ Unexpectedly succeeded with '{service_name}'")
                else:
                    print(f"❌ Failed as expected with '{service_name}': {response_data}")
                
                time.sleep(0.5)  # Small delay
        
        # Step 6: Summary and recommendations
        print(f"\n🎯 CRITICAL FINDINGS SUMMARY:")
        print("=" * 50)
        print(f"📊 Frontend Services: {len(frontend_service_names)} total")
        print(f"📊 Airtable Expertise Options: {len(expertise_options)} total")
        print(f"✅ Matching Services: {len(matching_services)}")
        print(f"❌ Mismatched Services: {len(mismatched_services)}")
        
        mismatch_percentage = (len(mismatched_services) / len(frontend_service_names)) * 100 if frontend_service_names else 0
        print(f"🚨 Mismatch Rate: {mismatch_percentage:.1f}%")
        
        print(f"\n💡 ROOT CAUSE IDENTIFIED:")
        if len(mismatched_services) > 0:
            print("❌ CRITICAL ISSUE: Frontend service names don't match Airtable expertise field options")
            print("📋 SOLUTION NEEDED: Either map service names to expertise values OR use correct endpoint")
        else:
            print("✅ No mismatch found - issue may be elsewhere")
        
        return True, {
            "frontend_services": frontend_service_names,
            "expertise_options": expertise_options,
            "matching_services": matching_services,
            "mismatched_services": mismatched_services,
            "mismatch_percentage": mismatch_percentage
        }

    def test_valid_expertise_updates(self):
        """Test updating employee with valid Airtable expertise values"""
        print("\n🔍 TESTING: Employee Update with Valid Airtable Expertise Values")
        print("=" * 80)
        
        # Get an employee to test with
        emp_success, emp_data = self.run_test(
            "Get Employee for Valid Expertise Test",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot test - no employees available")
            return False, {}
        
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        original_expertise = test_employee.get('expertise', [])
        
        print(f"🎯 Testing with Employee: {test_employee.get('full_name', 'Unknown')}")
        print(f"   ID: {employee_id}")
        print(f"   Original Expertise: {original_expertise}")
        
        # Test with valid Airtable expertise values
        valid_expertise_tests = [
            ["Massage"],
            ["Haircut"],
            ["Facials"],
            ["Coloring"],
            ["Manicure"],
            ["Pedicure"],
            ["Styling"],
            ["Massage", "Haircut"],
            ["Facials", "Styling"],
            ["Coloring", "Manicure", "Pedicure"]
        ]
        
        successful_updates = 0
        failed_updates = 0
        
        for i, expertise_list in enumerate(valid_expertise_tests):
            print(f"\n--- Test {i+1}: Valid Expertise {expertise_list} ---")
            
            update_data = {
                "expertise": expertise_list
            }
            
            success, response_data = self.run_test(
                f"Update Employee with Valid Expertise: {expertise_list}",
                "PUT",
                f"api/employees/{employee_id}",
                200,
                data=update_data
            )
            
            if success:
                successful_updates += 1
                print(f"✅ Update succeeded with {expertise_list}")
                
                # Verify what was stored
                verify_success, verify_data = self.run_test(
                    f"Verify Valid Expertise Update: {expertise_list}",
                    "GET",
                    f"api/employees/{employee_id}",
                    200
                )
                
                if verify_success:
                    stored_expertise = verify_data.get('expertise', [])
                    print(f"   Stored Expertise: {stored_expertise}")
                    
                    # Check if all values were stored correctly
                    if isinstance(stored_expertise, list):
                        all_stored = all(exp in stored_expertise for exp in expertise_list)
                        if all_stored:
                            print(f"✅ All expertise values stored correctly")
                        else:
                            print(f"⚠️  Some expertise values missing in storage")
            else:
                failed_updates += 1
                print(f"❌ Update failed with {expertise_list}: {response_data}")
            
            time.sleep(0.5)
        
        print(f"\n📊 VALID EXPERTISE TEST RESULTS:")
        print("-" * 40)
        print(f"✅ Successful Updates: {successful_updates}")
        print(f"❌ Failed Updates: {failed_updates}")
        print(f"📊 Total Tests: {len(valid_expertise_tests)}")
        
        success_rate = (successful_updates / len(valid_expertise_tests)) * 100 if valid_expertise_tests else 0
        print(f"🎯 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80, {
            "successful_updates": successful_updates,
            "failed_updates": failed_updates,
            "success_rate": success_rate
        }

    def test_service_mapping_functionality(self):
        """CRITICAL TEST: Service names mapping to expertise categories as claimed in review request"""
        print("\n🚨 CRITICAL TEST: Service Names Mapping to Expertise Categories")
        print("=" * 80)
        print("🎯 TESTING MAIN AGENT'S CLAIM: Service mapping logic converts service names to valid expertise")
        print("📋 EXPECTED MAPPING:")
        print("   • COMPRESSION BOOT THERAPY → 'Massage'")
        print("   • SHIATSU MASSAGE → 'Massage'") 
        print("   • FACIAL services → 'Facials'")
        print("   • HAIR services → 'Haircut'")
        print("   • COLOR services → 'Coloring'")
        print("   • MANI services → 'Manicure'")
        print("   • PEDI services → 'Pedicure'")
        print("   • STYLE services → 'Styling'")
        print("=" * 80)
        
        # Get an employee to test with
        emp_success, emp_data = self.run_test(
            "Get Employee for Service Mapping Test",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot test service mapping - no employees available")
            return False, {}
        
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        original_expertise = test_employee.get('expertise', [])
        
        print(f"\n🎯 Testing with Employee: {test_employee.get('full_name', 'Unknown')}")
        print(f"   ID: {employee_id}")
        print(f"   Original Expertise: {original_expertise}")
        
        # Test service names that should be mapped according to review request
        service_mapping_tests = [
            {
                "service_name": "COMPRESSION BOOT THERAPY",
                "expected_expertise": "Massage",
                "category": "Massage-related services"
            },
            {
                "service_name": "SHIATSU MASSAGE", 
                "expected_expertise": "Massage",
                "category": "Massage-related services"
            },
            {
                "service_name": "LYMPHATIC DRAINAGE",
                "expected_expertise": "Massage", 
                "category": "Massage-related services"
            },
            {
                "service_name": "FACIAL TREATMENT",
                "expected_expertise": "Facials",
                "category": "Facial/skincare services"
            },
            {
                "service_name": "MICROCURRENT FACIAL",
                "expected_expertise": "Facials",
                "category": "Facial/skincare services"
            },
            {
                "service_name": "HAIR CUT",
                "expected_expertise": "Haircut",
                "category": "Hair services"
            },
            {
                "service_name": "HAIR STYLING",
                "expected_expertise": "Styling",
                "category": "Styling services"
            },
            {
                "service_name": "COLOR TREATMENT",
                "expected_expertise": "Coloring",
                "category": "Coloring services"
            },
            {
                "service_name": "HIGHLIGHT SERVICE",
                "expected_expertise": "Coloring",
                "category": "Coloring services"
            },
            {
                "service_name": "MANICURE SERVICE",
                "expected_expertise": "Manicure",
                "category": "Nail services"
            },
            {
                "service_name": "PEDICURE TREATMENT",
                "expected_expertise": "Pedicure",
                "category": "Pedicure services"
            }
        ]
        
        mapping_results = {}
        successful_mappings = 0
        failed_mappings = 0
        
        for test_case in service_mapping_tests:
            service_name = test_case["service_name"]
            expected_expertise = test_case["expected_expertise"]
            category = test_case["category"]
            
            print(f"\n--- Testing Service Mapping: {service_name} ---")
            print(f"Category: {category}")
            print(f"Expected to map to: '{expected_expertise}'")
            
            # Test updating employee with this service name
            update_data = {
                "expertise": [service_name]  # Send original service name
            }
            
            success, response_data = self.run_test(
                f"Update Employee with Service: {service_name}",
                "PUT",
                f"api/employees/{employee_id}",
                200,  # Expecting success if mapping works
                data=update_data
            )
            
            mapping_results[service_name] = {
                "success": success,
                "response": response_data,
                "expected_expertise": expected_expertise,
                "category": category
            }
            
            if success:
                print(f"✅ Update succeeded - checking if mapping occurred...")
                
                # Verify what was actually stored in Airtable
                verify_success, verify_data = self.run_test(
                    f"Verify Mapping for {service_name}",
                    "GET",
                    f"api/employees/{employee_id}",
                    200
                )
                
                if verify_success:
                    stored_expertise = verify_data.get('expertise', [])
                    print(f"   Stored Expertise: {stored_expertise}")
                    
                    # Check if the expected mapped value is in the stored expertise
                    if isinstance(stored_expertise, list):
                        if expected_expertise in stored_expertise:
                            print(f"✅ MAPPING SUCCESS: '{service_name}' → '{expected_expertise}'")
                            successful_mappings += 1
                            mapping_results[service_name]['mapping_success'] = True
                        elif service_name in stored_expertise:
                            print(f"❌ MAPPING FAILED: '{service_name}' stored as-is (no mapping)")
                            failed_mappings += 1
                            mapping_results[service_name]['mapping_success'] = False
                        else:
                            print(f"⚠️  UNEXPECTED: Neither original nor mapped value found")
                            failed_mappings += 1
                            mapping_results[service_name]['mapping_success'] = False
                    else:
                        print(f"⚠️  UNEXPECTED: Expertise is not a list: {stored_expertise}")
                        failed_mappings += 1
                        mapping_results[service_name]['mapping_success'] = False
                    
                    mapping_results[service_name]['stored_expertise'] = stored_expertise
                else:
                    print(f"❌ Could not verify mapping for {service_name}")
                    failed_mappings += 1
                    mapping_results[service_name]['mapping_success'] = False
            else:
                print(f"❌ Update failed: {response_data}")
                failed_mappings += 1
                mapping_results[service_name]['mapping_success'] = False
            
            time.sleep(0.5)  # Small delay between tests
        
        # Summary of mapping test results
        print(f"\n📊 SERVICE MAPPING TEST RESULTS:")
        print("=" * 50)
        print(f"✅ Successful Mappings: {successful_mappings}")
        print(f"❌ Failed Mappings: {failed_mappings}")
        print(f"📊 Total Tests: {len(service_mapping_tests)}")
        
        mapping_success_rate = (successful_mappings / len(service_mapping_tests)) * 100 if service_mapping_tests else 0
        print(f"🎯 Mapping Success Rate: {mapping_success_rate:.1f}%")
        
        # Detailed results by category
        print(f"\n📋 DETAILED RESULTS BY CATEGORY:")
        print("-" * 40)
        
        categories = {}
        for service_name, result in mapping_results.items():
            category = result['category']
            if category not in categories:
                categories[category] = {'success': 0, 'total': 0}
            categories[category]['total'] += 1
            if result.get('mapping_success', False):
                categories[category]['success'] += 1
        
        for category, stats in categories.items():
            success_rate = (stats['success'] / stats['total']) * 100 if stats['total'] > 0 else 0
            print(f"• {category}: {stats['success']}/{stats['total']} ({success_rate:.1f}%)")
        
        # Final verdict
        print(f"\n🎯 MAIN AGENT'S SERVICE MAPPING CLAIM VERIFICATION:")
        print("-" * 50)
        
        if successful_mappings > 0:
            print(f"✅ PARTIAL SUCCESS: {successful_mappings} service mappings work correctly")
        else:
            print(f"❌ COMPLETE FAILURE: No service mappings work as claimed")
        
        if failed_mappings > 0:
            print(f"❌ ISSUES FOUND: {failed_mappings} service mappings failed")
        
        if mapping_success_rate >= 80:
            print("✅ OVERALL: Service mapping functionality is working well")
        elif mapping_success_rate >= 50:
            print("⚠️  OVERALL: Service mapping functionality is partially working")
        else:
            print("❌ OVERALL: Service mapping functionality is not working as claimed")
        
        return mapping_success_rate >= 50, {
            "successful_mappings": successful_mappings,
            "failed_mappings": failed_mappings,
            "mapping_success_rate": mapping_success_rate,
            "detailed_results": mapping_results,
            "category_stats": categories
        }

    def test_employee_update_with_real_service_names(self):
        """Test employee update with actual service names from /api/services"""
        print("\n🔍 TESTING: Employee Update with Real Service Names from /api/services")
        print("=" * 80)
        
        # Get actual services from the API
        services_success, services_data = self.run_test(
            "Get Real Services for Employee Update Test",
            "GET",
            "api/services",
            200
        )
        
        if not services_success or not isinstance(services_data, list):
            print("❌ Cannot test with real service names - services API failed")
            return False, {}
        
        # Get an employee to test with
        emp_success, emp_data = self.run_test(
            "Get Employee for Real Service Test",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not emp_success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot test - no employees available")
            return False, {}
        
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        
        print(f"🎯 Testing with Employee: {test_employee.get('full_name', 'Unknown')}")
        print(f"   ID: {employee_id}")
        print(f"📊 Found {len(services_data)} real services to test with")
        
        # Test with specific service names mentioned in review request
        target_services = [
            "COMPRESSION BOOT THERAPY",
            "SHIATSU MASSAGE", 
            "COUPLES MASSAGE",
            "INFRARED SAUNA BLANKET THERAPY"
        ]
        
        # Find these services in the actual services list
        found_services = []
        for service in services_data:
            service_name = service.get('name', '')
            if any(target in service_name.upper() for target in target_services):
                found_services.append(service_name)
        
        # If we didn't find the exact ones, use first few services
        if not found_services:
            found_services = [service.get('name', f'Service {i}') for i, service in enumerate(services_data[:5])]
        
        print(f"🎯 Testing with these real service names:")
        for i, service_name in enumerate(found_services[:5]):  # Test max 5
            print(f"   {i+1}. '{service_name}'")
        
        test_results = {}
        successful_updates = 0
        failed_updates = 0
        
        for service_name in found_services[:5]:  # Test max 5 services
            print(f"\n--- Testing Real Service: '{service_name}' ---")
            
            update_data = {
                "expertise": [service_name]
            }
            
            success, response_data = self.run_test(
                f"Update Employee with Real Service: {service_name}",
                "PUT",
                f"api/employees/{employee_id}",
                [200, 400, 500],  # Accept various responses
                data=update_data
            )
            
            test_results[service_name] = {
                "success": success,
                "response": response_data
            }
            
            if success:
                successful_updates += 1
                print(f"✅ Update succeeded with '{service_name}'")
                
                # Verify what was stored
                verify_success, verify_data = self.run_test(
                    f"Verify Real Service Update: {service_name}",
                    "GET",
                    f"api/employees/{employee_id}",
                    200
                )
                
                if verify_success:
                    stored_expertise = verify_data.get('expertise', [])
                    print(f"   Stored Expertise: {stored_expertise}")
                    test_results[service_name]['stored_expertise'] = stored_expertise
            else:
                failed_updates += 1
                print(f"❌ Update failed with '{service_name}': {response_data}")
            
            time.sleep(0.5)
        
        print(f"\n📊 REAL SERVICE NAMES TEST RESULTS:")
        print("-" * 40)
        print(f"✅ Successful Updates: {successful_updates}")
        print(f"❌ Failed Updates: {failed_updates}")
        print(f"📊 Total Tests: {len(found_services[:5])}")
        
        success_rate = (successful_updates / len(found_services[:5])) * 100 if found_services else 0
        print(f"🎯 Success Rate: {success_rate:.1f}%")
        
        return success_rate > 0, {
            "successful_updates": successful_updates,
            "failed_updates": failed_updates,
            "success_rate": success_rate,
            "test_results": test_results
        }

def main():
    print("🚨 EMPLOYEE MANAGEMENT SERVICE MAPPING TESTING")
    print("=" * 80)
    print("🎯 FOCUS: Testing main agent's claimed fix for service mapping issue")
    print("📋 MAIN AGENT CLAIM: Service names now map to valid expertise categories")
    print("📋 EXPECTED: 'COMPRESSION BOOT THERAPY' → 'Massage', etc.")
    print("=" * 80)
    
    # Setup
    tester = BackendAPITester()
    
    # Run basic connectivity tests first
    print("\n📋 Basic Connectivity Tests...")
    tester.test_root_endpoint()
    tester.test_health_check()
    
    print("\n🔍 MAIN TEST: SERVICE MAPPING FUNCTIONALITY")
    print("=" * 80)
    
    # Test the claimed service mapping functionality
    mapping_success, mapping_results = tester.test_service_mapping_functionality()
    
    print("\n🔍 ADDITIONAL TEST: REAL SERVICE NAMES FROM API")
    print("=" * 80)
    
    # Test with actual service names from the API
    real_service_success, real_service_results = tester.test_employee_update_with_real_service_names()
    
    # Test basic employee update functionality
    print("\n🔍 BASELINE TEST: Basic Employee Update")
    print("=" * 80)
    
    basic_success, basic_results = tester.test_employee_update_endpoint()
    
    # Print final results
    print("\n" + "=" * 80)
    print(f"📊 Testing Results: {tester.tests_passed}/{tester.tests_run} tests completed")
    
    # Final verdict on main agent's claims
    print("\n🎯 MAIN AGENT'S SERVICE MAPPING CLAIM VERIFICATION:")
    print("=" * 80)
    
    if mapping_success:
        print("✅ SERVICE MAPPING: Working as claimed")
    else:
        print("❌ SERVICE MAPPING: NOT working as claimed")
    
    if real_service_success:
        print("✅ REAL SERVICES: Can update employees with some real service names")
    else:
        print("❌ REAL SERVICES: Cannot update employees with real service names")
    
    if basic_success:
        print("✅ BASIC UPDATES: Employee update endpoint working")
    else:
        print("❌ BASIC UPDATES: Employee update endpoint failing")
    
    # Overall assessment
    if mapping_success and basic_success:
        print("\n✅ OVERALL: Main agent's fix appears to be working")
        return 0
    elif basic_success:
        print("\n⚠️  OVERALL: Basic functionality works but service mapping may have issues")
        return 1
    else:
        print("\n❌ OVERALL: Employee update functionality has critical issues")
        return 2

if __name__ == "__main__":
    sys.exit(main())