export const useSavedView = (onClearAll: () => void) => {
  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your reading list?')) {
      onClearAll();
    }
  };

  return {
    handleClearAll
  };
};
