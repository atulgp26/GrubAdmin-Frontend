import EmployeeDetails from '@/components/pages/employees/EmployeeDetails'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <div>
      <Suspense fallback={null}>
        <EmployeeDetails/>
      </Suspense>
    </div>
  )
}

export default page
