export interface DeviceCoordinates {
  latitude: number;
  longitude: number;
}

export function getDeviceCoordinates(): Promise<DeviceCoordinates> {
  if (!navigator.geolocation) return Promise.reject(new Error('Location is not supported on this device.'));

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: Number(coords.latitude.toFixed(3)),
        longitude: Number(coords.longitude.toFixed(3)),
      }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) reject(new Error('Location permission was blocked. Allow it in your browser settings and try again.'));
        else if (error.code === error.TIMEOUT) reject(new Error('Finding your location took too long. Please try again.'));
        else reject(new Error('Your location could not be found.'));
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 5 * 60_000 },
    );
  });
}
