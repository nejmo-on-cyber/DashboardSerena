#!/usr/bin/env python3

import requests
import json

def analyze_airtable_schema():
    """Analyze the actual Airtable schema to understand available fields"""
    
    base_url = "https://c48ce902-ba6c-445a-9dbb-4df3b8272b13.preview.emergentagent.com"
    
    print("🔍 Analyzing Airtable Employee Schema")
    print("=" * 60)
    
    # Get employee data to see actual field structure
    try:
        response = requests.get(f"{base_url}/api/employee-availability", timeout=10)
        if response.status_code == 200:
            employees = response.json()
            if employees:
                print(f"✅ Found {len(employees)} employees")
                
                # Analyze first employee's fields
                first_employee = employees[0]
                print(f"\n📋 Employee: {first_employee.get('full_name', 'Unknown')}")
                print("📋 Available Fields:")
                for field, value in first_employee.items():
                    print(f"   {field}: {value} (type: {type(value).__name__})")
                
                # Get individual employee to see more details
                employee_id = first_employee['id']
                individual_response = requests.get(f"{base_url}/api/employees/{employee_id}", timeout=10)
                if individual_response.status_code == 200:
                    individual_data = individual_response.json()
                    print(f"\n📋 Individual Employee GET Fields:")
                    for field, value in individual_data.items():
                        print(f"   {field}: {value} (type: {type(value).__name__})")
                
                return employees
            else:
                print("❌ No employees found")
                return None
        else:
            print(f"❌ Failed to get employees: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Error getting employees: {e}")
        return None

def test_field_by_field():
    """Test updating each field individually to identify which ones work"""
    
    base_url = "https://c48ce902-ba6c-445a-9dbb-4df3b8272b13.preview.emergentagent.com"
    
    print("\n🔍 Testing Each Field Individually")
    print("=" * 60)
    
    # Get employee ID
    try:
        response = requests.get(f"{base_url}/api/employee-availability", timeout=10)
        employees = response.json()
        employee_id = employees[0]['id']
        employee_name = employees[0]['full_name']
        print(f"✅ Testing with Employee: {employee_name} (ID: {employee_id})")
    except Exception as e:
        print(f"❌ Error getting employees: {e}")
        return
    
    # Test fields one by one
    test_fields = {
        "contact_number": "123-456-7890",
        "availability_days": ["Monday", "Tuesday", "Wednesday"],
        "expertise": ["Massage", "Facial"],
        "status": "Active",
        "employee_number": "EMP001",
        "email": "test@example.com",
        "full_name": "Test Name",
        "profile_picture": "test.jpg",
        "start_date": "2024-01-01"
    }
    
    results = {}
    
    for field_name, field_value in test_fields.items():
        print(f"\n🧪 Testing field: {field_name}")
        
        test_data = {field_name: field_value}
        
        try:
            response = requests.put(
                f"{base_url}/api/employees/{employee_id}",
                json=test_data,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   ✅ SUCCESS: {field_name} updated successfully")
                results[field_name] = "SUCCESS"
            else:
                print(f"   ❌ FAILED: {field_name} failed with status {response.status_code}")
                try:
                    error_data = response.json()
                    error_detail = error_data.get('detail', 'Unknown error')
                    print(f"   ❌ Error: {error_detail}")
                    results[field_name] = f"FAILED: {error_detail}"
                except:
                    results[field_name] = f"FAILED: Status {response.status_code}"
                    
        except Exception as e:
            print(f"   ❌ EXCEPTION: {field_name} caused exception: {e}")
            results[field_name] = f"EXCEPTION: {e}"
    
    print("\n📊 FIELD TEST SUMMARY:")
    print("=" * 40)
    for field, result in results.items():
        status = "✅" if result == "SUCCESS" else "❌"
        print(f"{status} {field}: {result}")
    
    return results

def main():
    print("🚀 Airtable Employee Schema Analysis")
    print("=" * 80)
    
    # Analyze schema
    employees = analyze_airtable_schema()
    
    # Test individual fields
    if employees:
        field_results = test_field_by_field()
        
        # Provide recommendations
        print("\n💡 RECOMMENDATIONS:")
        print("=" * 40)
        working_fields = [field for field, result in field_results.items() if result == "SUCCESS"]
        failing_fields = [field for field, result in field_results.items() if result != "SUCCESS"]
        
        print(f"✅ Working fields ({len(working_fields)}): {', '.join(working_fields)}")
        print(f"❌ Failing fields ({len(failing_fields)}): {', '.join(failing_fields)}")
        
        print("\n🔧 SUGGESTED FIX:")
        print("The main agent should update the employee update endpoint to:")
        print("1. Only use the working fields identified above")
        print("2. Remove or properly handle the failing fields")
        print("3. The try-catch blocks need to be around the actual airtable.update() call")

if __name__ == "__main__":
    main()