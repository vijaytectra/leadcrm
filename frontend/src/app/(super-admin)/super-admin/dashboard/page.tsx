

import { ProtectedRoute } from '@/components/ProtectedRoute'
import React from 'react'

const SuperAdminDashboardPage = () => {
    return (
        <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>

            <div className='text-black'>SuperAdminDashboardPage</div>
        </ProtectedRoute>


    )
}

export default SuperAdminDashboardPage