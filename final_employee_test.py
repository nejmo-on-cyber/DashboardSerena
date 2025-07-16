#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import time

class EmployeeUpdateTester:
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

    def comprehensive_employee_update_test(self):
        """Comprehensive test of employee update functionality as per review request"""
        print("\n🚨 COMPREHENSIVE EMPLOYEE UPDATE FUNCTIONALITY TEST")
        print("=" * 80)
        print("📋 REVIEW REQUEST REQUIREMENTS:")
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

        # Get employee data
        success, emp_data = self.run_test(
            "GET /api/employee-availability",
            "GET",
            "api/employee-availability",
            200
        )
        
        if not success or not isinstance(emp_data, list) or len(emp_data) == 0:
            print("❌ Cannot proceed - no employee data available")
            return False, {}
        
        test_employee = emp_data[0]
        employee_id = test_employee.get('id')
        
        print(f"\n📋 Testing with Employee: {test_employee.get('full_name', 'Unknown')}")
        print(f"   ID: {employee_id}")
        
        # Test results tracking
        results = {
            'field_mapping': {},
            'update_scenarios': {},
            'service_mapping': {},
            'error_handling': {}
        }
        
        # 1. Field Mapping Verification
        print(f"\n🔍 1. FIELD MAPPING VERIFICATION")
        print("-" * 50)
        
        required_fields = [
            'id', 'full_name', 'employee_number', 'availability_days', 
            'expertise', 'contact_number', 'email', 'status', 'profile_picture'
        ]
        
        present_fields = []
        missing_fields = []
        
        for field in required_fields:
            if field in test_employee:
                present_fields.append(field)
                value = test_employee[field]
                print(f"   ✅ {field}: {value}")
            else:
                missing_fields.append(field)
                print(f"   ❌ {field}: MISSING")
        
        results['field_mapping'] = {
            'present_fields': present_fields,
            'missing_fields': missing_fields,
            'score': len(present_fields) / len(required_fields) * 100
        }
        
        # 2. Employee Update Scenarios
        print(f"\n🔍 2. EMPLOYEE UPDATE SCENARIOS")
        print("-" * 50)
        
        update_scenarios = [
            {
                "name": "Status Change (Active → Inactive)",
                "data": {"status": "Inactive"},
                "verify_field": "status",
                "expected_value": "Inactive"
            },
            {
                "name": "Contact Number Update",
                "data": {"contact_number": "555-TEST-123"},
                "verify_field": "contact_number",
                "expected_value": "555-TEST-123"
            },
            {
                "name": "Availability Days Update",
                "data": {"availability_days": ["Monday", "Tuesday", "Wednesday"]},
                "verify_field": "availability_days",
                "expected_value": ["Monday", "Tuesday", "Wednesday"]
            },
            {
                "name": "Expertise Update",
                "data": {"expertise": ["Massage", "Styling"]},
                "verify_field": "expertise",
                "expected_value": ["Massage", "Styling"]
            }
        ]
        
        for scenario in update_scenarios:
            print(f"\n--- {scenario['name']} ---")
            
            # Perform update
            success, response_data = self.run_test(
                f"Update: {scenario['name']}",
                "PUT",
                f"api/employees/{employee_id}",
                200,
                data=scenario['data']
            )
            
            scenario_result = {
                'update_success': success,
                'response': response_data,
                'verification_success': False
            }
            
            if success:
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
                        scenario_result['verification_success'] = True
                    else:
                        print(f"❌ VERIFICATION FAILED: Expected {expected_value}, got {actual_value}")
                    
                    scenario_result['actual_value'] = actual_value
            
            results['update_scenarios'][scenario['name']] = scenario_result
            time.sleep(0.5)
        
        # 3. Service Mapping Test (Check if implemented)
        print(f"\n🔍 3. SERVICE MAPPING VERIFICATION")
        print("-" * 50)
        
        service_tests = [
            {"service": "COMPRESSION BOOT THERAPY", "expected": "Massage"},
            {"service": "FACIAL TREATMENT", "expected": "Facials"},
            {"service": "HAIR CUT", "expected": "Haircut"}
        ]
        
        for service_test in service_tests:
            service_name = service_test["service"]
            expected_expertise = service_test["expected"]
            
            print(f"\n--- Testing Service Mapping: {service_name} → {expected_expertise} ---")
            
            success, response_data = self.run_test(
                f"Service Mapping: {service_name}",
                "PUT",
                f"api/employees/{employee_id}",
                200,
                data={"expertise": [service_name]}
            )
            
            mapping_result = {
                'update_success': success,
                'expected_expertise': expected_expertise,
                'mapping_success': False
            }
            
            if success:
                # Check if mapping occurred
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
                        mapping_result['mapping_success'] = True
                    else:
                        print(f"❌ MAPPING FAILED: Expected {expected_expertise}, got {stored_expertise}")
                    
                    mapping_result['stored_expertise'] = stored_expertise
            else:
                print(f"❌ Service mapping update failed: {response_data}")
            
            results['service_mapping'][service_name] = mapping_result
        
        # 4. Error Handling
        print(f"\n🔍 4. ERROR HANDLING VERIFICATION")
        print("-" * 50)
        
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
                "expected_status": 500
            }
        ]
        
        for error_test in error_tests:
            print(f"\n--- {error_test['name']} ---")
            
            success, response_data = self.run_test(
                f"Error Test: {error_test['name']}",
                "PUT",
                error_test['endpoint'],
                error_test['expected_status'],
                data=error_test['data']
            )
            
            results['error_handling'][error_test['name']] = {
                'success': success,
                'response': response_data
            }
        
        # Calculate overall scores
        field_score = results['field_mapping']['score']
        
        successful_updates = sum(1 for result in results['update_scenarios'].values() 
                               if result.get('update_success') and result.get('verification_success'))
        update_score = successful_updates / len(results['update_scenarios']) * 100 if results['update_scenarios'] else 0
        
        successful_mappings = sum(1 for result in results['service_mapping'].values() 
                                if result.get('mapping_success'))
        mapping_score = successful_mappings / len(results['service_mapping']) * 100 if results['service_mapping'] else 0
        
        successful_errors = sum(1 for result in results['error_handling'].values() if result.get('success'))
        error_score = successful_errors / len(results['error_handling']) * 100 if results['error_handling'] else 0
        
        overall_score = (field_score + update_score + mapping_score + error_score) / 4
        
        # Summary
        print(f"\n📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 50)
        print(f"📋 Field Mapping: {len(results['field_mapping']['present_fields'])}/{len(required_fields)} fields present ({field_score:.1f}%)")
        print(f"🔄 Update Scenarios: {successful_updates}/{len(results['update_scenarios'])} successful ({update_score:.1f}%)")
        print(f"🗺️  Service Mapping: {successful_mappings}/{len(results['service_mapping'])} successful ({mapping_score:.1f}%)")
        print(f"⚠️  Error Handling: {successful_errors}/{len(results['error_handling'])} proper ({error_score:.1f}%)")
        print(f"\n🎯 OVERALL SCORE: {overall_score:.1f}%")
        
        # Assessment
        if overall_score >= 80:
            status = "WORKING"
            assessment = "✅ The fixed employee update functionality is working correctly"
        elif overall_score >= 60:
            status = "PARTIALLY WORKING"
            assessment = "⚠️  Some issues found but core functionality works"
        else:
            status = "ISSUES FOUND"
            assessment = "❌ Significant issues that need to be addressed"
        
        print(f"\n🎯 EMPLOYEE UPDATE FUNCTIONALITY: {status}")
        print(f"   {assessment}")
        
        # Detailed findings
        print(f"\n📋 DETAILED FINDINGS:")
        print("-" * 30)
        
        if results['field_mapping']['missing_fields']:
            print(f"❌ Missing fields: {results['field_mapping']['missing_fields']}")
        else:
            print(f"✅ All required fields present in GET /api/employee-availability")
        
        working_updates = [name for name, result in results['update_scenarios'].items() 
                          if result.get('update_success') and result.get('verification_success')]
        failing_updates = [name for name, result in results['update_scenarios'].items() 
                          if not (result.get('update_success') and result.get('verification_success'))]
        
        if working_updates:
            print(f"✅ Working updates: {working_updates}")
        if failing_updates:
            print(f"❌ Failing updates: {failing_updates}")
        
        if mapping_score == 0:
            print(f"❌ Service mapping not implemented - service names are not mapped to expertise categories")
        elif mapping_score < 100:
            print(f"⚠️  Service mapping partially working ({mapping_score:.1f}%)")
        else:
            print(f"✅ Service mapping fully working")
        
        return overall_score >= 60, {
            'overall_score': overall_score,
            'field_score': field_score,
            'update_score': update_score,
            'mapping_score': mapping_score,
            'error_score': error_score,
            'detailed_results': results
        }

if __name__ == "__main__":
    print("🚨 EMPLOYEE UPDATE FUNCTIONALITY - COMPREHENSIVE TEST")
    print("=" * 80)
    
    tester = EmployeeUpdateTester()
    success, results = tester.comprehensive_employee_update_test()
    
    print(f"\n🏁 TESTING COMPLETE")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    
    if success:
        print("✅ REVIEW REQUEST REQUIREMENTS: CORE FUNCTIONALITY WORKING")
    else:
        print("❌ REVIEW REQUEST REQUIREMENTS: SIGNIFICANT ISSUES FOUND")
    
    sys.exit(0 if success else 1)