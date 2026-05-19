import React, { useState, useEffect } from 'react';
import Modal from '../../ui/Modal';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import Select from '@/components/ui/Select';
import MobileNumberInput from '@/components/ui/MobileNumberInput';
import { MdCalendarToday, MdDone } from 'react-icons/md';
import { showSuccess, showError } from '@/components/ui/toast';
import { roleService } from '@/api/services/roleService';

const EditEmployeeModal = ({ open, onClose, employeeData, onConfirm }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    role: '',
    location: '',
    employeeId: '',
    joiningDate: ''
  });

  const [originalData, setOriginalData] = useState({});
  const [focusedField, setFocusedField] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [phoneValid, setPhoneValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    role: '',
    location: '',
    joiningDate: ''
  });

  // Fetch roles from API
  useEffect(() => {
    const fetchRoles = async () => {
      if (!open) return;
      
      try {
        setRolesLoading(true);
        const response = await roleService.getRoles();
        
        if (response.success && response.code === 200 && response.data?.roles) {
          // Transform roles for Select component
          const transformedRoles = response.data.roles.map((role) => {
            // Calculate permissions count
            const permissionsCount = role.permissions_json 
              ? Object.values(role.permissions_json).reduce((total, permissions) => {
                  return total + (Array.isArray(permissions) ? permissions.length : 0);
                }, 0)
              : 0;
            
            return {
              value: role.id, // Use role ID for value
              label: role.name,
              description: `${permissionsCount} permissions`,
              roleData: role, // Keep full role data for reference
            };
          });
          
          setRoleOptions(transformedRoles);
        } else {
          console.error("Failed to fetch roles:", response);
          setRoleOptions([]);
        }
      } catch (error) {
        console.error("Error fetching roles:", error);
        setRoleOptions([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, [open]);

  // Populate form data when employee data changes
  useEffect(() => {
    if (employeeData && employeeData.originalData) {
      // Parse name to get first and last name
      const nameParts = employeeData.name ? employeeData.name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Get role_id from originalData if available
      let roleId = '';
      if (employeeData.originalData.role_id) {
        roleId = employeeData.originalData.role_id;
      } else {
        // Fallback: try to find role_id by matching role name in roleOptions
        const roleName = employeeData.role || '';
        const foundRole = roleOptions.find(ro => ro.label === roleName);
        if (foundRole) {
          roleId = foundRole.value;
        }
      }

      const initialFormData = {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: employeeData.phone || '',
        email: employeeData.email || '',
        role: roleId, // Use role_id instead of role name
        location: employeeData.location || '',
        employeeId: employeeData.empId ? employeeData.empId.replace('#', '') : '',
        joiningDate: employeeData.joinDate || ''
      };

      setFormData(initialFormData);
      setOriginalData(initialFormData);
      
      // Phone number is optional - just validate if present, don't block form
      if (initialFormData.phoneNumber) {
        let phoneDigits = initialFormData.phoneNumber.replace(/\D/g, '');
        
        // If phone number starts with country code (91), remove it
        if (phoneDigits.startsWith('91') && phoneDigits.length > 2) {
          phoneDigits = phoneDigits.substring(2); // Remove country code
        } else if (initialFormData.phoneNumber.startsWith('+91')) {
          // If it starts with "+91", remove it
          const withoutCode = initialFormData.phoneNumber.substring(3).trim();
          phoneDigits = withoutCode.replace(/\D/g, '');
        }
        
        const isValid = phoneDigits.length === 10;
        setPhoneValid(isValid);
        // Don't show error for optional phone field on initial load
      }
    }
  }, [employeeData, roleOptions]);

  // Validation functions
  const validateFirstName = (value) => {
    if (!value || value.trim().length === 0) {
      return 'First name is required';
    }
    if (value.trim().length < 2) {
      return 'First name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
      return 'First name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validateLastName = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Last name is required';
    }
    if (value.trim().length < 2) {
      return 'Last name must be at least 2 characters';
    }
    if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) {
      return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validateEmail = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateRole = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Role is required';
    }
    return '';
  };

  const validateLocation = (value) => {
    // Location is optional - no validation needed
    return '';
  };

  const validateJoiningDate = (value) => {
    // Joining date is optional - no validation needed
    return '';
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate the field in real-time - only for required fields
    let error = '';
    switch (field) {
      case 'firstName':
        error = validateFirstName(value);
        break;
      case 'lastName':
        error = validateLastName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'role':
        error = validateRole(value);
        break;
      // Location and joiningDate are optional - no validation errors
      case 'location':
      case 'joiningDate':
      default:
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleFocus = (field) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const handlePhoneChange = (phoneValue) => {
    setFormData(prev => ({
      ...prev,
      phoneNumber: phoneValue
    }));
  };

  const handlePhoneValidationChange = (isValid) => {
    setPhoneValid(isValid);
    // Phone is optional - only show error if user is actively typing invalid number
    // Don't set error on validation change, let user fix it if they want
  };

  const isFormValid = () => {
    // Validate required fields: firstName, lastName, email, role
    // Phone, location, and joining date are optional - don't block submission
    const firstNameError = validateFirstName(formData.firstName);
    const lastNameError = validateLastName(formData.lastName);
    const emailError = validateEmail(formData.email);
    const roleError = validateRole(formData.role);

    return (
      !firstNameError &&
      !lastNameError &&
      !emailError &&
      !roleError
    );
  };

  const hasChanges = () => {
    return (
      formData.firstName !== originalData.firstName ||
      formData.lastName !== originalData.lastName ||
      formData.phoneNumber !== originalData.phoneNumber ||
      formData.email !== originalData.email ||
      formData.role !== originalData.role ||
      formData.location !== originalData.location ||
      formData.employeeId !== originalData.employeeId ||
      formData.joiningDate !== originalData.joiningDate
    );
  };

  const handleSubmit = () => {
    // Validate all required fields before submission
    const firstNameError = validateFirstName(formData.firstName);
    const lastNameError = validateLastName(formData.lastName);
    const emailError = validateEmail(formData.email);
    const roleError = validateRole(formData.role);

    // Set validation errors if any
    setValidationErrors({
      firstName: firstNameError,
      lastName: lastNameError,
      email: emailError,
      role: roleError,
      phoneNumber: '',
      location: '',
      joiningDate: ''
    });

    // If there are validation errors, show toast and don't submit
    if (firstNameError || lastNameError || emailError || roleError) {
      const errorMessages = [];
      if (firstNameError) errorMessages.push('First name');
      if (lastNameError) errorMessages.push('Last name');
      if (emailError) errorMessages.push('Email');
      if (roleError) errorMessages.push('Role');
      
      showError(`Please fill all required fields: ${errorMessages.join(', ')}`);
      return;
    }

    if (isFormValid()) {
      // Get role name from roleOptions if role_id is selected
      const selectedRole = roleOptions.find(ro => ro.value === formData.role);
      const roleName = selectedRole ? selectedRole.label : employeeData.role || '';
      
      const updatedEmployeeData = {
        ...employeeData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phoneNumber,
        email: formData.email,
        role: roleName, // Send role name for display
        role_id: formData.role, // Also include role_id for API
        location: formData.location,
        empId: formData.employeeId ? `#${formData.employeeId}` : employeeData.empId,
        joinDate: formData.joiningDate,
        updated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })
      };
      
      onConfirm(updatedEmployeeData);
      // Modal will be closed by parent component after API call succeeds
      // Note: Success message will be shown by parent component after API call
    }
  };

  const handleReset = () => {
    setFormData({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      role: '',
      location: '',
      employeeId: '',
      joiningDate: ''
    });
    setOriginalData({});
    setFocusedField('');
    setPhoneValid(false);
    setValidationErrors({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      role: '',
      location: '',
      joiningDate: ''
    });
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  if (!open) return null;

  return (
    <Modal 
      open={open} 
      onClose={handleCancel}
      width="max-w-2xl"
      customClass=" overflow-auto"
      closeOnOutsideClick={true}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2 mt-2">
          <h1 className='text-[var(--color-neutral-primary)] font-semibold text-2xl'>Edit employee details</h1>
          <p className="text-[var(--color-stroke-brand)] text-base">
            Any changes made will take effect immediately.
          </p>
        </div>

        {/* Basic Details */}
        <div className="space-y-4">
          <h3 className="text-[var(--color-neutral-secondary)] text-base">
            Basic details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
                isFocused={focusedField === 'firstName'}
              />
              {validationErrors.firstName && (
                <p className="absolute top-full left-0 mt-1 text-xs text-red-500">{validationErrors.firstName}</p>
              )}
            </div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
                isFocused={focusedField === 'lastName'}
              />
              {validationErrors.lastName && (
                <p className="absolute top-full left-0 mt-1 text-xs text-red-500">{validationErrors.lastName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h3 className="text-[var(--color-neutral-secondary)] text-base">
            Contact details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <MobileNumberInput
                value={formData.phoneNumber}
                onChange={handlePhoneChange}
                onValidationChange={handlePhoneValidationChange}
                placeholder="Enter mobile number"
                className="w-full"
              />
              {/* Phone is optional - no error message */}
            </div>
            <div className="relative">
              <Input
                type="email"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                isFocused={focusedField === 'email'}
              />
              {validationErrors.email && (
                <p className="absolute top-full left-0 mt-1 text-xs text-red-500">{validationErrors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Role and Employee ID */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Role permissions
            </h3>
            <div className="relative">
              <Select
                options={roleOptions}
                value={formData.role}
                onChange={(newValue) => handleInputChange("role", newValue)}
                placeholder="Select role"
                style={{ height: '38px', width: '250px' }}
                showSearch={true}
                fontSize="!text-base"
                padding="!py-2"
                className=""
              />
              {validationErrors.role && (
                <p className="absolute top-full left-0 mt-1 text-xs text-red-500">{validationErrors.role}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-[var(--color-neutral-secondary)] text-base font-medium">
              Employee ID 
            </h3>
            <div className="relative">
              <Input
                type="text"
                placeholder="Employee ID"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                onFocus={() => handleFocus('employeeId')}
                onBlur={handleBlur}
                isFocused={focusedField === 'employeeId'}
                className="pl-8"
              />
              <span className={`${formData.employeeId?"text-[var(--color-neutral-secondary)]":""} absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-neutral-light)] text-sm pointer-events-none z-10`}>
                #
              </span>
            </div>
          </div>
        </div>

        {/* Location and Joining Date */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
            <h3 className="text-[var(--color-neutral-secondary)] text-base">
              Assigned location <span className="text-sm text-[var(--color-neutral-secondary)]">(optional)</span>
            </h3>
            <div className="relative">
              <Input
                type="text"
                placeholder="Office location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                onFocus={() => handleFocus('location')}
                onBlur={handleBlur}
                isFocused={focusedField === 'location'}
              />
              {/* Location is optional - no error message */}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-[var(--color-neutral-secondary)] text-base font-medium">
              Joining date <span className="text-sm text-[var(--color-neutral-secondary)]">(optional)</span>
            </h3>
            <div className="relative">
              <Input
                type="text"
                placeholder="Select date"
                value={formData.joiningDate}
                onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                onFocus={() => handleFocus('joiningDate')}
                onBlur={handleBlur}
                isFocused={focusedField === 'joiningDate'}
                className="pr-10"
              />
              <MdCalendarToday className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--info-panel-view-bg)] pointer-events-none" />
              {/* Joining date is optional - no error message */}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-[var(--color-box-border)]">
          <Button
            variant="grayOutline"
            size="mdLg"
            onClick={handleCancel}
            className="flex-1"
          >
            CANCEL
          </Button>
          <Button
            variant="disabledPrimary"
            size="mdLg"
            onClick={handleSubmit}
            disabled={!isFormValid() || !hasChanges()}
            className="flex-1 disabled:!bg-[var(--color-stroke-neutral)] disabled:!border-[var(--color-box-border)]"
          >
            <span className="flex items-center justify-center gap-2">
              {isFormValid() && hasChanges() && <MdDone stroke={1} className='w-6 h-6'/> }
              SAVE CHANGES
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EditEmployeeModal;
