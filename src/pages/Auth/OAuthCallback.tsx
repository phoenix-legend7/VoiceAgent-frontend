import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../../core/axiosInstance";
import { Loading } from "../../Layout/Loading";
import { getUserByToken, useAuth } from "../../core/authProvider";

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { saveAuth, setCurrentUser } = useAuth();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    const handleOAuth = async () => {
      try {
        const query = window.location.search;
        const response = await axiosInstance.get(`/auth/google/verify${query}`);
        const data = response.data;
        saveAuth({ access_token: data.access_token });
        const { data: user } = await getUserByToken(data.access_token);
        setCurrentUser(user);

        // Check if email is verified
        if (user && !user.is_verified) {
          localStorage.setItem("pending-verification-email", user.email);
          navigate(`/verify-email?email=${encodeURIComponent(user.email)}`);
          return;
        }

        // Check if payment method exists
        try {
          const paymentResponse = await axiosInstance.get("/billing/payment-methods");
          const paymentMethods = paymentResponse.data.payment_methods || [];

          if (paymentMethods.length === 0) {
            navigate("/setup-payment");
            return;
          }
        } catch (paymentErr) {
          console.error("Failed to check payment methods:", paymentErr);
          navigate("/setup-payment");
          return;
        }

        // All checks passed - go to dashboard
        const onboardingComplete = localStorage.getItem('onboarding-complete');
        if (!onboardingComplete) {
          navigate("/onboarding");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error handling OAuth success:", error);
        navigate("/login");
        setTimeout(() => {
          toast.error("Failed to login. Please try again.");
        }, 1000);
      }
    };
    handleOAuth();
  }, [navigate]);

  return <Loading />;
};

export default OAuthCallback;
