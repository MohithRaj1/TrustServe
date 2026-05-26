import { useState, useCallback } from 'react';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, body) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error(`AI API call to ${url} failed:`, err);
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const predictFreshness = useCallback(async (foodType, cookedHoursAgo, temperatureC, humidity) => {
    return request('/api/predict-freshness', {
      food_type: foodType,
      cooked_hours_ago: Number(cookedHoursAgo),
      temperature_c: Number(temperatureC),
      humidity: Number(humidity),
    });
  }, [request]);

  const predictWaste = useCallback(async (eventType, guestCount, foodPreparedKg) => {
    return request('/api/predict-waste', {
      event_type: eventType,
      guest_count: Number(guestCount),
      food_prepared_kg: Number(foodPreparedKg),
    });
  }, [request]);

  const recommendNGO = useCallback(async (donorLatitude, donorLongitude, urgencyLevel) => {
    return request('/api/recommend-ngo', {
      donor_latitude: Number(donorLatitude),
      donor_longitude: Number(donorLongitude),
      urgency_level: urgencyLevel,
    });
  }, [request]);

  const predictAll = useCallback(async (payload) => {
    return request('/api/predict-all', payload);
  }, [request]);

  const predictImageFreshness = useCallback(async (imagePath) => {
    return request('/api/predict-image-freshness', { image_path: imagePath });
  }, [request]);

  return {
    loading,
    error,
    predictFreshness,
    predictWaste,
    recommendNGO,
    predictAll,
    predictImageFreshness,
  };
};

export default useAI;
