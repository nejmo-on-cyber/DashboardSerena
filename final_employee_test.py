#!/usr/bin/env python3

import requests
import json

def test_review_request_working_fields():
    """Test the review request scenario with only working fields"""
    
    base_url = "https://a092d38d-5c45-40a1-a065-ffc27435430c.preview.emergentagent.com"
    
    print("🔍 Testing Review Request with ONLY Working Fields")
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
    
    # Test data from review request - ONLY working fields
    working_fields_data = {
        "contact_number": "123-456-7890",
        "availability_days": ["Monday", "Tuesday", "Wednesday"]
        # Removed: expertise, status (these fields don't work)
    }
    
    print(f"\n📝 Working Fields Test Data: {json.dumps(working_fields_data, indent=2)}")
    
    try:
        response = requests.put(
            f"{base_url}/api/employees/{employee_id}",
            json=working_fields_data,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Text: {response.text}")
        
        if response.status_code == 200:
            print("✅ SUCCESS: Employee update with working fields succeeded!")
            response_data = response.json()
            print(f"✅ Response: {json.dumps(response_data, indent=2)}")
            
            # Verify the update
            verify_response = requests.get(f"{base_url}/api/employees/{employee_id}", timeout=10)
            if verify_response.status_code == 200:
                verify_data = verify_response.json()
                print(f"\n✅ Verification - Updated Employee Data:")
                print(f"   Contact Number: {verify_data.get('contact_number', 'Not set')}")
                print(f"   Availability: {verify_data.get('availability_days', [])}")
                
                # Check if the values were actually updated
                if (verify_data.get('contact_number') == "123-456-7890" and 
                    verify_data.get('availability_days') == ["Monday", "Tuesday", "Wednesday"]):
                    print("✅ CONFIRMED: Values were actually updated in Airtable!")
                    return True
                else:
                    print("⚠️  WARNING: Values may not have been updated correctly")
                    return False
            
            return True
        else:
            print(f"❌ FAILED: Even working fields failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Exception during update: {e}")
        return False

def main():
    print("🚀 Final Employee Update Test")
    print("Testing with only the fields that are confirmed to work")
    print("=" * 80)
    
    success = test_review_request_working_fields()
    
    print("\n" + "=" * 80)
    print("📊 FINAL CONCLUSION:")
    
    if success:
        print("✅ PARTIAL SUCCESS: Employee update works for basic fields")
        print("   - contact_number updates successfully")
        print("   - availability_days updates successfully")
        print("   - The main agent's fix partially works")
        print("\n❌ REMAINING ISSUES:")
        print("   - expertise field fails (permissions issue)")
        print("   - status field doesn't exist in Airtable schema")
        print("   - Other fields like email, employee_number don't exist")
        print("\n💡 RECOMMENDATION:")
        print("   The main agent needs to further refine the fix to:")
        print("   1. Only use confirmed working fields")
        print("   2. Handle non-existent fields more gracefully")
        print("   3. Fix the try-catch logic to prevent errors from reaching Airtable")
    else:
        print("❌ FAILURE: Employee update is still completely broken")
        print("   Even the basic working fields are failing")
        print("   The main agent's fix did not work at all")

if __name__ == "__main__":
    main()