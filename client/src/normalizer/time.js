export const minutesToHours = (value) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
<<<<<<< HEAD

=======
>>>>>>> 5a7df89... Fix typos
  if (hours === 0) {
    return `${value}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h${minutes}`;
};
