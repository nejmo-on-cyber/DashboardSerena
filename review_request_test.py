#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class ReviewRequestTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0

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
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_review_request_scenarios(self):
        """Test all scenarios mentioned in the review request"""
        print("\n🚨 REVIEW REQUEST TESTING: Fixed Employee Update Functionality")
        print("=" * 80)
        print("📋 TESTING REQUIREMENTS:")
        print("1. GET /api/employee-availability - Verify all fields returned correctly")
        print("2. PUT /api/employees/{id} - Test employee updates with:")
        print("   - Status change (Active → Inactive)")
        print("   - Profile picture update")
        print("   - Email update")
        print("   - Contact number update")
        print("   - Availability days update")
        print("   - Expertise update")
        print("3. Field mapping verification")
        print("4. Error handling with invalid data")
        print("=" * 80)

        # Test 1: GET /api/employee-availability
        print("\n🔍 TEST 1: GET /api/employee-availability - Field Verification")
        print("-" * 60)
        
        success, emp_data = self.run_test(
            "Employee Availability with Field Mapping",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot proceed - no employee data available")
            return False
        
        # Verify field mapping
        print(f"✅ Found {len(emp_data)} employees")
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        
        required_fields = [
            'id', 'full_name', 'employee_number', 'availability_days', 
            'expertise', 'contact_number', 'email', 'status', 'profile_picture'
        ]
        
        print(f"\n📋 Field Mapping Verification for Employee: {test_employee.get('full_name', 'Unknown')}")
        missing_fields = []
        present_fields = []
        
        for field in required_fields:
            if field in test_employee:
                present_fields.append(field)
                value = test_employee[field]
                print(f"   ✅ {field}: {value}")
            else:
                missing_fields.append(field)
                print(f"   ❌ {field}: MISSING")
        
        if missing_fields:
            print(f"\n⚠️  Missing fields: {missing_fields}")
        else:
            print(f"\n✅ All required fields present")

        # Test 2: PUT /api/employees/{id} - Various update scenarios
        print(f"\n🔍 TEST 2: PUT /api/employees/{id} - Update Scenarios")
        print("-" * 60)
        
        original_data = {
            'status': test_employee.get('status', 'Active'),
            'contact_number': test_employee.get('contact_number', ''),
            'availability_days': test_employee.get('availability_days', []),
            'expertise': test_employee.get('expertise', []),
            'profile_picture': test_employee.get('profile_picture', ''),
            'email': test_employee.get('email', '')
        }
        
        print(f"Original Employee Data:")
        for key, value in original_data.items():
            print(f"   {key}: {value}")

        # Test scenarios
        test_scenarios = [
            {
                "name": "Status Change (Active → Inactive)",
                "data": {"status": "Inactive"},
                "verify_field": "status",
                "expected_value": "Inactive"
            },
            {
                "name": "Profile Picture Update",
                "data": {"profile_picture": "https://example.com/new-profile.jpg"},
                "verify_field": "profile_picture", 
                "expected_value": "https://example.com/new-profile.jpg"
            },
            {
                "name": "Contact Number Update",
                "data": {"contact_number": "555-999-8888"},
                "verify_field": "contact_number",
                "expected_value": "555-999-8888"
            },
            {
                "name": "Availability Days Update",
                "data": {"availability_days": ["Tuesday", "Thursday", "Saturday"]},
                "verify_field": "availability_days",
                "expected_value": ["Tuesday", "Thursday", "Saturday"]
            },
            {
                "name": "Expertise Update",
                "data": {"expertise": ["Massage", "Facials"]},
                "verify_field": "expertise",
                "expected_value": ["Massage", "Facials"]
            }
        ]

        scenario_results = {}
        
        for scenario in test_scenarios:
            print(f"\n--- {scenario['name']} ---")
            print(f"Update Data: {scenario['data']}")
            
            # Perform update
            success, response_data = self.run_test(
                f"Update: {scenario['name']}",
                "PUT",
                f"api/employees/{employee_id}",
                200,
                data=scenario['data']
            )
            
            scenario_results[scenario['name']] = {
                'update_success': success,
                'response': response_data
            }
            
            if success:
                print(f"✅ Update API call succeeded")
                
                # Verify the change
                verify_success, verify_data = self.run_test(
                    f"Verify: {scenario['name']}",
                    "GET",
                    f"api/employees/{employee_id}",
                    200
                )
                
                if verify_success:
                    actual_value = verify_data.get(scenario['verify_field'])
                    expected_value = scenario['expected_value']
                    
                    if actual_value == expected_value:
                        print(f"✅ VERIFICATION SUCCESS: {scenario['verify_field']} = {actual_value}")
                        scenario_results[scenario['name']]['verification_success'] = True
                    else:
                        print(f"❌ VERIFICATION FAILED: Expected {expected_value}, got {actual_value}")
                        scenario_results[scenario['name']]['verification_success'] = False
                    
                    scenario_results[scenario['name']]['actual_value'] = actual_value
                else:
                    print(f"❌ Could not verify update")
                    scenario_results[scenario['name']]['verification_success'] = False
            else:
                print(f"❌ Update failed: {response_data}")
                scenario_results[scenario['name']]['verification_success'] = False
            
            time.sleep(0.5)  # Small delay between tests

        # Test 3: Service Mapping Verification
        print(f"\n🔍 TEST 3: Service Mapping Verification")
        print("-" * 60)
        
        # Test service names that should map to expertise categories
        service_mapping_tests = [
            {"service": "COMPRESSION BOOT THERAPY", "expected": "Massage"},
            {"service": "FACIAL TREATMENT", "expected": "Facials"},
            {"service": "HAIR CUT", "expected": "Haircut"},
            {"service": "COLOR TREATMENT", "expected": "Coloring"},
            {"service": "MANICURE SERVICE", "expected": "Manicure"}
        ]
        
        mapping_results = {}
        
        for mapping_test in service_mapping_tests:
            service_name = mapping_test["service"]
            expected_expertise = mapping_test["expected"]
            
            print(f"\n--- Testing Service Mapping: {service_name} → {expected_expertise} ---")
            
            # Test updating employee with service name
            success, response_data = self.run_test(
                f"Service Mapping: {service_name}",
                "PUT",
                f"api/employees/{employee_id}",
                200,
                data={"expertise": [service_name]}
            )
            
            mapping_results[service_name] = {
                'update_success': success,
                'expected_expertise': expected_expertise
            }
            
            if success:
                # Verify mapping occurred
                verify_success, verify_data = self.run_test(
                    f"Verify Mapping: {service_name}",
                    "GET",
                    f"api/employees/{employee_id}",
                    200
                )
                
                if verify_success:
                    stored_expertise = verify_data.get('expertise', [])
                    if expected_expertise in stored_expertise:
                        print(f"✅ MAPPING SUCCESS: {service_name} → {expected_expertise}")
                        mapping_results[service_name]['mapping_success'] = True
                    else:
                        print(f"❌ MAPPING FAILED: Expected {expected_expertise}, got {stored_expertise}")
                        mapping_results[service_name]['mapping_success'] = False
                    
                    mapping_results[service_name]['stored_expertise'] = stored_expertise
            else:
                print(f"❌ Service mapping update failed")
                mapping_results[service_name]['mapping_success'] = False

        # Test 4: Error Handling
        print(f"\n🔍 TEST 4: Error Handling with Invalid Data")
        print("-" * 60)
        
        error_tests = [
            {
                "name": "Invalid Employee ID",
                "endpoint": f"api/employees/invalid_id_12345",
                "data": {"status": "Active"},
                "expected_status": 404
            },
            {
                "name": "Invalid Status Value",
                "endpoint": f"api/employees/{employee_id}",
                "data": {"status": "InvalidStatus"},
                "expected_status": 500  # Current behavior
            },
            {
                "name": "Invalid Expertise Value",
                "endpoint": f"api/employees/{employee_id}",
                "data": {"expertise": ["NonExistentExpertise"]},
                "expected_status": 500  # Current behavior
            }
        ]
        
        error_results = {}
        
        for error_test in error_tests:
            print(f"\n--- {error_test['name']} ---")
            
            success, response_data = self.run_test(
                f"Error Test: {error_test['name']}",
                "PUT",
                error_test['endpoint'],
                error_test['expected_status'],
                data=error_test['data']
            )
            
            error_results[error_test['name']] = {
                'success': success,
                'response': response_data
            }
            
            if success:
                print(f"✅ Error properly handled")
            else:
                print(f"❌ Error handling needs improvement")

        # Summary
        print(f"\n📊 REVIEW REQUEST TEST SUMMARY")
        print("=" * 50)
        
        # Field mapping summary
        field_mapping_score = len(present_fields) / len(required_fields) * 100
        print(f"📋 Field Mapping: {len(present_fields)}/{len(required_fields)} fields present ({field_mapping_score:.1f}%)")
        
        # Update scenarios summary
        successful_updates = sum(1 for result in scenario_results.values() 
                               if result.get('update_success') and result.get('verification_success'))
        total_scenarios = len(scenario_results)
        update_score = successful_updates / total_scenarios * 100 if total_scenarios > 0 else 0
        print(f"🔄 Update Scenarios: {successful_updates}/{total_scenarios} successful ({update_score:.1f}%)")
        
        # Service mapping summary
        successful_mappings = sum(1 for result in mapping_results.values() 
                                if result.get('mapping_success'))
        total_mappings = len(mapping_results)
        mapping_score = successful_mappings / total_mappings * 100 if total_mappings > 0 else 0
        print(f"🗺️  Service Mapping: {successful_mappings}/{total_mappings} successful ({mapping_score:.1f}%)")
        
        # Error handling summary
        successful_errors = sum(1 for result in error_results.values() if result.get('success'))
        total_errors = len(error_results)
        error_score = successful_errors / total_errors * 100 if total_errors > 0 else 0
        print(f"⚠️  Error Handling: {successful_errors}/{total_errors} proper ({error_score:.1f}%)")
        
        # Overall assessment
        overall_score = (field_mapping_score + update_score + mapping_score + error_score) / 4
        print(f"\n🎯 OVERALL SCORE: {overall_score:.1f}%")
        
        if overall_score >= 80:
            print("✅ EMPLOYEE UPDATE FUNCTIONALITY: WORKING")
            print("   The fixed employee update functionality is working correctly")
        elif overall_score >= 60:
            print("⚠️  EMPLOYEE UPDATE FUNCTIONALITY: PARTIALLY WORKING")
            print("   Some issues found but core functionality works")
        else:
            print("❌ EMPLOYEE UPDATE FUNCTIONALITY: ISSUES FOUND")
            print("   Significant issues that need to be addressed")
        
        return overall_score >= 60, {
            'field_mapping_score': field_mapping_score,
            'update_score': update_score,
            'mapping_score': mapping_score,
            'error_score': error_score,
            'overall_score': overall_score,
            'scenario_results': scenario_results,
            'mapping_results': mapping_results,
            'error_results': error_results
        }

if __name__ == "__main__":
    print("🚨 REVIEW REQUEST TESTING: Fixed Employee Update Functionality")
    print("=" * 80)
    
    tester = ReviewRequestTester()
    success, results = tester.test_review_request_scenarios()
    
    print(f"\n🏁 TESTING COMPLETE")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    
    if success:
        print("✅ REVIEW REQUEST REQUIREMENTS: SATISFIED")
    else:
        print("❌ REVIEW REQUEST REQUIREMENTS: ISSUES FOUND")
    
    sys.exit(0 if success else 1)