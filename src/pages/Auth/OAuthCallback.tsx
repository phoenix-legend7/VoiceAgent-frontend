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
        const agentResponse = await axiosInstance.get("/agent");
        const agents = agentResponse.data || [];
        if (!agents.length) {
          navigate("/wizard");
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
