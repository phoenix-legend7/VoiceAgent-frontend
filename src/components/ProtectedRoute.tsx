import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../core/authProvider'
import axiosInstance from '../core/axiosInstance'
import { Loading } from '../Layout/Loading'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { currentUser } = useAuth()
  const location = useLocation()
  const [isChecking, setIsChecking] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null)

  useEffect(() => {
    const checkRequirements = async () => {
      if (!currentUser) {
        setShouldRedirect('/login')
        setIsChecking(false)
        return
      }

      // Check if email is verified
      if (!currentUser.is_verified) {
        // Store email for verification page
        localStorage.setItem("pending-verification-email", currentUser.email)
        setShouldRedirect(`/verify-email?email=${encodeURIComponent(currentUser.email)}`)
        setIsChecking(false)
        return
      }

      // Check if payment method exists
      try {
        const paymentResponse = await axiosInstance.get("/billing/payment-methods")
        const paymentMethods = paymentResponse.data.payment_methods || []

        if (paymentMethods.length === 0) {
          setShouldRedirect('/setup-payment')
          setIsChecking(false)
          return
        }
      } catch (error) {
        // If we can't check payment methods, assume we need to set it up
        console.error("Failed to check payment methods:", error)
        setShouldRedirect('/setup-payment')
        setIsChecking(false)
        return
      }

      // All checks passed
      setIsChecking(false)
    }

    checkRequirements()
  }, [currentUser])

  if (isChecking) {
    return <Loading />
  }

  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace state={{ from: location }} />
  }

  return <>{children}</>
}

