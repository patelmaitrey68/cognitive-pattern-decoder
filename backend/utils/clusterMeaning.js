exports.getClusterMeaning = (cluster) => {
  switch (cluster) {
    case 0:
      return "Focused & consistent coder";
    case 1:
      return "Fast but error-prone coder";
    case 2:
      return "Distracted or multitasking coder";
    default:
      return "Unknown coding pattern";
  }
};
