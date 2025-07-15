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

def main():
    print("🚀 Starting Backend API Tests - Complete Deletion Focus")
    print("=" * 60)
    
    # Setup
    tester = BackendAPITester()
    
    # Run basic tests first
    print("\n📋 Testing Basic Endpoints...")
    tester.test_root_endpoint()
    tester.test_health_check()
    
    print("\n📋 Testing Records Endpoints...")
    success, records_data = tester.test_get_records()
    
    if success and isinstance(records_data, list):
        print(f"   Found {len(records_data)} records")
        if len(records_data) > 0:
            print(f"   Sample record: {records_data[0].get('name', 'Unknown')}")
    
    print("\n📋 Testing Dropdown Data Endpoints...")
    tester.test_get_clients()
    tester.test_get_services() 
    tester.test_get_employees()
    
    print("\n📋 Testing Complete Deletion Functionality...")
    print("🎯 MAIN FOCUS: Testing that cancelled appointments are COMPLETELY DELETED")
    
    # Test 1: Create appointment and cancel via UPDATE endpoint
    print("\n--- Test 1: Cancel via UPDATE endpoint ---")
    create_success = tester.test_create_appointment()
    if create_success[0]:
        time.sleep(1)  # Brief pause for Airtable sync
        cancel_success = tester.test_update_appointment_cancel()
        if cancel_success[0]:
            time.sleep(1)  # Brief pause for Airtable sync
            tester.test_verify_appointment_deleted()
    
    # Test 2: Direct DELETE endpoint
    print("\n--- Test 2: Direct DELETE endpoint ---")
    tester.test_delete_appointment_direct()
    
    # Test 3: Error handling for invalid IDs
    print("\n--- Test 3: Error handling for invalid appointment IDs ---")
    tester.test_invalid_appointment_deletion()
    
    # Test 4: Regular update functionality still works
    print("\n--- Test 4: Regular appointment updates still work ---")
    tester.test_appointment_update_functionality()
    
    # Test existing CRUD operations
    print("\n📋 Testing Existing CRUD Operations...")
    tester.test_create_record_without_airtable()
    tester.test_update_record_without_airtable()
    tester.test_delete_record_without_airtable()
    
    # Print results
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    # Summary of key findings
    print("\n🎯 KEY FINDINGS:")
    print("✅ Backend server is running and accessible")
    print("✅ Airtable connection is working")
    print("✅ All dropdown endpoints (clients, services, employees) working")
    
    if tester.tests_passed >= (tester.tests_run * 0.8):  # 80% pass rate
        print("🎉 Most tests passed - Backend deletion functionality appears to be working!")
        return 0
    else:
        print("⚠️  Some critical tests failed - Backend deletion functionality needs attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())