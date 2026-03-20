import { useState, useCallback } from "react";

export function useRetry(maxRetries = 3, delay = 1000) {
  const [retrying, setRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const withRetry = useCallback(async (fn, retryMessage = "Retrying...") => {
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          setRetrying(true);
          setRetryCount(attempt);
          toast.info(`${retryMessage} (Attempt ${attempt} of ${maxRetries})`);
        }
        
        const result = await fn();
        
        if (attempt > 0) {
          toast.success("Request completed successfully!");
        }
        
        setRetrying(false);
        setRetryCount(0);
        return result;
        
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }
    
    setRetrying(false);
    setRetryCount(0);
    throw lastError;
  }, [maxRetries, delay]);

  return { withRetry, retrying, retryCount };
}