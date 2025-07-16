#!/usr/bin/env python3

import requests
import json
import sys

def test_employee_update_specific():
    """Test the specific employee update scenario from the review request"""
    
    base_url = "https://c48ce902-ba6c-445a-9dbb-4df3b8272b13.preview.emergentagent.com"
    
    print("🔍 Testing Employee Update with Review Request Data")
    print("=" * 60)
    
    # First get an employee ID
    try:
        response = requests.get(f"{base_url}/api/employee-availability", timeout=10)
        if response.status_code == 200:
            employees = response.json()
            if employees:
                employee_id = employees[0]['id']
                employee_name = employees[0]['full_name']
                print(f"✅ Using Employee: {employee_name} (ID: {employee_id})")
            else:
                print("❌ No employees found")
                return False
        else:
            print(f"❌ Failed to get employees: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error getting employees: {e}")
        return False
    
    # Test data from review request
    update_data = {
        "contact_number": "123-456-7890",
        "availability_days": ["Monday", "Tuesday", "Wednesday"],
        "expertise": ["Massage", "Facial"],
        "status": "Active"
    }
    
    print(f"\n📝 Test Data: {json.dumps(update_data, indent=2)}")
    
    # Test the PUT endpoint
    try:
        response = requests.put(
            f"{base_url}/api/employees/{employee_id}",
            json=update_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Employee update worked!")
            response_data = response.json()
            print(f"✅ Response: {json.dumps(response_data, indent=2)}")
            
            # Verify the update
            verify_response = requests.get(f"{base_url}/api/employees/{employee_id}", timeout=10)
            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                print(f"\n✅ Verification - Updated Employee Data:")
                print(f"   Contact Number: {verify_data.get('contact_number', 'Not set')}")
                print(f"   Availability: {verify_data.get('availability_days', [])}")
                print(f"   Expertise: {verify_data.get('expertise', [])}")
                print(f"   Status: {verify_data.get('status', 'Not set')}")
            
            return True
        else:
            print(f"❌ FAILED: Employee update failed with status {response.status_code}")
            try:
                error_data = response.json()
                print(f"❌ Error Details: {json.dumps(error_data, indent=2)}")
            except:
                print(f"❌ Error Text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during update: {e}")
        return False

def test_employee_update_minimal():
    """Test with only the fields that should definitely work"""
    
    base_url = "https://c48ce902-ba6c-445a-9dbb-4df3b8272b13.preview.emergentagent.com"
    
    print("\n🔍 Testing Employee Update with Minimal Safe Fields")
    print("=" * 60)
    
    # Get employee ID
    try:
        response = requests.get(f"{base_url}/api/employee-availability", timeout=10)
        employees = response.json()
        employee_id = employees[0]['id']
        employee_name = employees[0]['full_name']
        print(f"✅ Using Employee: {employee_name} (ID: {employee_id})")
    except Exception as e:
        print(f"❌ Error getting employees: {e}")
        return False
    
    # Test with only fields that are known to exist
    minimal_data = {
        "contact_number": "555-123-4567",
        "availability_days": ["Monday", "Wednesday", "Friday"]
    }
    
    print(f"\n📝 Minimal Test Data: {json.dumps(minimal_data, indent=2)}")
    
    try:
        response = requests.put(
            f"{base_url}/api/employees/{employee_id}",
            json=minimal_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Minimal employee update worked!")
            return True
        else:
            print(f"❌ FAILED: Even minimal update failed")
            return False
            
    except Exception as e:
        print(f"❌ Exception during minimal update: {e}")
        return False

def main():
    print("🚀 Employee Update Specific Testing")
    print("Testing the exact scenario from the review request")
    print("=" * 80)
    
    # Test 1: Full update as requested
    success1 = test_employee_update_specific()
    
    # Test 2: Minimal update to isolate issues
    success2 = test_employee_update_minimal()
    
    print("\n" + "=" * 80)
    print("📊 FINAL RESULTS:")
    print(f"   Full Update Test: {'✅ PASSED' if success1 else '❌ FAILED'}")
    print(f"   Minimal Update Test: {'✅ PASSED' if success2 else '❌ FAILED'}")
    
    if success1:
        print("\n🎉 CONCLUSION: Employee update fix is working!")
        print("   The main agent's fix successfully handles field errors gracefully")
        return 0
    elif success2:
        print("\n⚠️  CONCLUSION: Partial success - some fields still problematic")
        print("   Basic fields work, but some fields in the test data are still failing")
        return 1
    else:
        print("\n❌ CONCLUSION: Employee update is still broken")
        print("   The main agent's fix did not resolve the issue")
        return 2

if __name__ == "__main__":
    sys.exit(main())